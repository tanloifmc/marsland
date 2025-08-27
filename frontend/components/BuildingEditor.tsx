import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid, Square, Plus, Save, RotateCcw, RotateCw, Trash2, Maximize2, Minimize2, Image, Upload, Info, HelpCircle, LayoutGrid, Layers, Building, Palette, Sun, Camera, Download, Share2 } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Plane, Box, useTexture, Text as DreiText, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { LandPlot } from "@/types/land";
import BuildingLibrary from "@/components/BuildingLibrary";



interface BuildingData {
  id?: string;
  land_id: string;
  owner_id: string;
  building_type: string;
  name: string;
  description: string;
  grid_position: { x: number; y: number; width: number; height: number; rotation: number };
  model_url?: string;
  thumbnail_url?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BuildingEditorProps {
  land: LandPlot;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: BuildingData) => void;
  initialBuilding?: BuildingData | null;
}

const GRID_SIZE = 20; // 20x20 grid
const CELL_SIZE = 0.5; // Size of each grid cell in 3D units
const GRID_OFFSET = (GRID_SIZE * CELL_SIZE) / 2; // Offset to center the grid

const BuildingItem: React.FC<{ 
  position: [number, number, number]; 
  size: [number, number, number]; 
  rotation: [number, number, number];
  color: string;
  name: string;
  modelUrl?: string;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}> = ({ position, size, rotation, color, name, modelUrl, onPointerOver, onPointerOut, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Box ref={meshRef} args={size} position={position} rotation={rotation} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
      <meshStandardMaterial color={color} />
      <DreiText
        position={[position[0], position[1] + size[1] / 2 + 0.1, position[2]]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </DreiText>
    </Box>
  );
};

const GridHelper: React.FC = () => {
  const lines = [];
  for (let i = 0; i <= GRID_SIZE; i++) {
    lines.push(
      <line key={`row-${i}`}><bufferGeometry><float32BufferAttribute attach="attributes-position" array={new Float32Array([-GRID_OFFSET, 0, i * CELL_SIZE - GRID_OFFSET, GRID_OFFSET, 0, i * CELL_SIZE - GRID_OFFSET])} itemSize={3} /></bufferGeometry><lineBasicMaterial color={0x444444} /></line>
    );
    lines.push(
      <line key={`col-${i}`}><bufferGeometry><float32BufferAttribute attach="attributes-position" array={new Float32Array([i * CELL_SIZE - GRID_OFFSET, 0, -GRID_OFFSET, i * CELL_SIZE - GRID_OFFSET, 0, GRID_OFFSET])} itemSize={3} /></bufferGeometry><lineBasicMaterial color={0x444444} /></line>
    );
  }
  return <group>{lines}</group>;
};

const BuildingEditor3D: React.FC<{ 
  currentBuilding: BuildingData | null;
  setCurrentBuilding: React.Dispatch<React.SetStateAction<BuildingData | null>>;
  selectedTool: string;
  onSelectBuilding: (building: BuildingData) => void;
}> = ({ currentBuilding, setCurrentBuilding, selectedTool, onSelectBuilding }) => {
  const { camera } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const handlePointerMove = useCallback((event: any) => {
    if (selectedTool === 'add' && planeRef.current) {
      const intersect = event.intersections[0];
      if (intersect && intersect.object === planeRef.current) {
        const x = Math.floor((intersect.point.x + GRID_OFFSET) / CELL_SIZE);
        const z = Math.floor((intersect.point.z + GRID_OFFSET) / CELL_SIZE);
        // console.log(`Hovering over grid cell: (${x}, ${z})`);
      }
    }
  }, [selectedTool]);

  const handlePointerDown = useCallback((event: any) => {
    if (selectedTool === 'add' && planeRef.current) {
      const intersect = event.intersections[0];
      if (intersect && intersect.object === planeRef.current) {
        const x = Math.floor((intersect.point.x + GRID_OFFSET) / CELL_SIZE);
        const z = Math.floor((intersect.point.z + GRID_OFFSET) / CELL_SIZE);
        
        const newBuilding: BuildingData = {
          land_id: '', // Will be set by parent component
          owner_id: '', // Will be set by parent component
          building_type: 'house',
          name: 'New Building',
          description: 'A newly placed building',
          grid_position: { x, y: z, width: 1, height: 1, rotation: 0 },
          is_public: true,
        };
        setCurrentBuilding(newBuilding);
        onSelectBuilding(newBuilding);
      }
    }
  }, [selectedTool, setCurrentBuilding, onSelectBuilding]);

  return (
    <>
      <OrbitControls makeDefault />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Plane
        ref={planeRef}
        args={[GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      >
        <meshStandardMaterial color="#333333" transparent opacity={0.1} />
      </Plane>
      <GridHelper />

      {currentBuilding && (
        <BuildingItem
          position={[
            currentBuilding.grid_position.x * CELL_SIZE + CELL_SIZE / 2 - GRID_OFFSET,
            currentBuilding.grid_position.width * CELL_SIZE / 2, // Assuming height is based on width for now
            currentBuilding.grid_position.y * CELL_SIZE + CELL_SIZE / 2 - GRID_OFFSET,
          ]}
          size={[
            currentBuilding.grid_position.width * CELL_SIZE,
            currentBuilding.grid_position.width * CELL_SIZE, // Placeholder height
            currentBuilding.grid_position.height * CELL_SIZE,
          ]}
          rotation={[0, currentBuilding.grid_position.rotation * (Math.PI / 2), 0]}
          color="orange"
          name={currentBuilding.name}
          modelUrl={currentBuilding.model_url}
          onPointerOver={() => {}}
          onPointerOut={() => {}}
          onClick={() => onSelectBuilding(currentBuilding)}
        />
      )}
    </>
  );
};

export default function BuildingEditor({ land, user, isOpen, onClose, onSave, initialBuilding }: BuildingEditorProps) {
  const [currentBuilding, setCurrentBuilding] = useState<BuildingData | null>(initialBuilding || null);
  const [selectedTool, setSelectedTool] = useState<'add' | 'move' | 'rotate' | 'delete' | 'none'>('none');
  const [buildingName, setBuildingName] = useState(initialBuilding?.name || '');
  const [buildingDescription, setBuildingDescription] = useState(initialBuilding?.description || '');
  const [buildingType, setBuildingType] = useState(initialBuilding?.building_type || 'house');
  const [isPublic, setIsPublic] = useState(initialBuilding?.is_public ?? true);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showBuildingLibrary, setShowBuildingLibrary] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (initialBuilding) {
      setCurrentBuilding(initialBuilding);
      setBuildingName(initialBuilding.name);
      setBuildingDescription(initialBuilding.description);
      setBuildingType(initialBuilding.building_type);
      setIsPublic(initialBuilding.is_public);
    } else {
      setCurrentBuilding(null);
      setBuildingName('');
      setBuildingDescription('');
      setBuildingType('house');
      setIsPublic(true);
    }
  }, [initialBuilding, isOpen]);

  const handleSaveBuilding = async () => {
    if (!currentBuilding || !land || !user) return;

    setIsSaving(true);
    try {
      let uploadedModelUrl = currentBuilding.model_url;
      let uploadedThumbnailUrl = currentBuilding.thumbnail_url;

      if (modelFile) {
        const { data, error } = await supabase.storage
          .from("building-models")
          .upload(`${user.id}/${land.id}/${modelFile.name}`, modelFile, { cacheControl: "3600", upsert: true });
        if (error) throw error;
        uploadedModelUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/building-models/${data.path}`;
      }

      if (thumbnailFile) {
        const { data, error } = await supabase.storage
          .from("building-thumbnails")
          .upload(`${user.id}/${land.id}/${thumbnailFile.name}`, thumbnailFile, { cacheControl: "3600", upsert: true });
        if (error) throw error;
        uploadedThumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/building-thumbnails/${data.path}`;
      }

      const buildingToSave: BuildingData = {
        ...currentBuilding,
        land_id: land.id,
        owner_id: user.id,
        name: buildingName,
        description: buildingDescription,
        building_type: buildingType,
        is_public: isPublic,
        model_url: uploadedModelUrl,
        thumbnail_url: uploadedThumbnailUrl,
        updated_at: new Date().toISOString(), // Always update updated_at
      };

      if (currentBuilding.id) {
        // Update existing building
        const { data, error } = await supabase
          .from("buildings")
          .update(buildingToSave)
          .eq("id", currentBuilding.id)
          .select()
          .single();
        if (error) throw error;
        onSave(data);
      } else {
        // Insert new building
        const { data, error } = await supabase
          .from("buildings")
          .insert({ ...buildingToSave, created_at: new Date().toISOString() }) // Add created_at for new buildings
          .select()
          .single();
        if (error) throw error;
        onSave(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving building:', error);
      alert('Failed to save building. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    if (currentBuilding) {
      setCurrentBuilding(prev => {
        if (!prev) return null;
        const newRotation = (prev.grid_position.rotation + (direction === 'right' ? 1 : -1) + 4) % 4;
        return { ...prev, grid_position: { ...prev.grid_position, rotation: newRotation } };
      });
    }
  };

  const handleDelete = async () => {
    if (!currentBuilding || !currentBuilding.id) return;
    if (!confirm('Are you sure you want to delete this building?')) return;

    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', currentBuilding.id);
      if (error) throw error;
      alert('Building deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting building:', error);
      alert('Failed to delete building. Please try again.');
    }
  };

  const handleSelectBuilding = (building: BuildingData) => {
    setCurrentBuilding(building);
    setBuildingName(building.name);
    setBuildingDescription(building.description);
    setBuildingType(building.building_type);
    setIsPublic(building.is_public);
  };

  return (
    <React.Fragment>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-orange-500/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Build on {land.land_id}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: 3D Editor */}
                <div className="flex-1 bg-gray-800 relative">
                  <Canvas camera={{ position: [0, 10, 10], fov: 75 }}>
                    <Suspense fallback={null}>
                      <BuildingEditor3D 
                        currentBuilding={currentBuilding}
                        setCurrentBuilding={setCurrentBuilding}
                        selectedTool={selectedTool}
                        onSelectBuilding={handleSelectBuilding}
                      />
                    </Suspense>
                  </Canvas>
                  <div className="absolute top-4 left-4 p-2 bg-black/50 rounded-lg flex flex-col space-y-2">
                    <button 
                      onClick={() => setSelectedTool('add')}
                      className={`p-2 rounded-md ${selectedTool === 'add' ? 'bg-orange-500' : 'bg-gray-700'} text-white`}
                      title="Add Building"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedTool('move')}
                      className={`p-2 rounded-md ${selectedTool === 'move' ? 'bg-orange-500' : 'bg-gray-700'} text-white`}
                      title="Move Building"
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleRotate('left')}
                      className="p-2 rounded-md bg-gray-700 text-white"
                      title="Rotate Left"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleRotate('right')}
                      className="p-2 rounded-md bg-gray-700 text-white"
                      title="Rotate Right"
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="p-2 rounded-md bg-red-600 text-white"
                      title="Delete Building"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Right Panel: Building Properties */}
                <div className="w-96 bg-gray-800/50 border-l border-gray-700 p-6 overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-4">Building Properties</h3>
                  
                  {!currentBuilding ? (
                    <div className="text-center py-12 text-gray-400">
                      <Info className="h-12 w-12 mx-auto mb-4" />
                      <p>Select or add a building to edit its properties.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="buildingName" className="block text-gray-300 text-sm font-bold mb-2">Name</label>
                        <input
                          type="text"
                          id="buildingName"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                          value={buildingName}
                          onChange={(e) => setBuildingName(e.target.value)}
                          placeholder="e.g., My Martian Home"
                        />
                      </div>

                      <div>
                        <label htmlFor="buildingDescription" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                        <textarea
                          id="buildingDescription"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500 h-24"
                          value={buildingDescription}
                          onChange={(e) => setBuildingDescription(e.target.value)}
                          placeholder="Describe your building..."
                        ></textarea>
                      </div>

                      <div>
                        <label htmlFor="buildingType" className="block text-gray-300 text-sm font-bold mb-2">Type</label>
                        <select
                          id="buildingType"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                          value={buildingType}
                          onChange={(e) => setBuildingType(e.target.value)}
                        >
                          <option value="house">House</option>
                          <option value="factory">Factory</option>
                          <option value="farm">Farm</option>
                          <option value="research_center">Research Center</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Visibility</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isPublic"
                            className="mr-2 h-4 w-4 text-orange-500 rounded border-gray-600 focus:ring-orange-500 bg-gray-700"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                          />
                          <label htmlFor="isPublic" className="text-gray-300">Public (visible to others)</label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="modelUpload" className="block text-gray-300 text-sm font-bold mb-2">3D Model (GLB/GLTF)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            id="modelUpload"
                            accept=".glb,.gltf"
                            className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                            onChange={(e) => setModelFile(e.target.files ? e.target.files[0] : null)}
                          />
                          <button
                            onClick={() => setShowBuildingLibrary(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm transition-colors flex items-center space-x-2"
                          >
                            <Layers className="h-4 w-4" />
                            <span>Browse Library</span>
                          </button>
                        </div>
                        {currentBuilding.model_url && (
                          <p className="text-gray-400 text-xs mt-2">Current model: <a href={currentBuilding.model_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a></p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="thumbnailUpload" className="block text-gray-300 text-sm font-bold mb-2">Thumbnail Image</label>
                        <input
                          type="file"
                          id="thumbnailUpload"
                          accept=".png,.jpg,.jpeg"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                          onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
                        />
                        {currentBuilding.thumbnail_url && (
                          <p className="text-gray-400 text-xs mt-2">Current thumbnail: <a href={currentBuilding.thumbnail_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a></p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          onClick={handleSaveBuilding}
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition-all font-semibold flex items-center space-x-2"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <Save className="h-5 w-5" />
                          )}
                          <span>{isSaving ? 'Saving...' : 'Save Building'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showBuildingLibrary && (
        <BuildingLibrary
          isOpen={showBuildingLibrary}
          onClose={() => setShowBuildingLibrary(false)}
          onSelectBuilding={(building) => {
            setCurrentBuilding(prev => ({
              ...(prev || {} as any),
              name: building.name,
              description: building.description,
              building_type: building.building_type,
              model_url: building.model_url,
              thumbnail_url: building.thumbnail_url,
              is_public: building.is_public,
              grid_position: prev?.grid_position || { x: 0, y: 0, width: 1, height: 1, rotation: 0 } // Ensure grid_position exists
            }));
            setBuildingName(building.name);
            setBuildingDescription(building.description);
            setBuildingType(building.building_type);
            setIsPublic(building.is_public);
            setShowBuildingLibrary(false);
          }}
        />
      )}
    </React.Fragment>
  );
}

