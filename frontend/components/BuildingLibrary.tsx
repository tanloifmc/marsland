
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Building, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BuildingData {
  id: string;
  land_id: string;
  owner_id: string;
  building_type: string;
  name: string;
  description: string;
  grid_position: { x: number; y: number; width: number; height: number; rotation: number };
  model_url?: string;
  thumbnail_url?: string;
  is_public: boolean;
  created_at: string;
}

interface BuildingLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBuilding: (building: BuildingData) => void;
}

export default function BuildingLibrary({ isOpen, onClose, onSelectBuilding }: BuildingLibraryProps) {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPublicBuildings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public buildings:', error);
      } else {
        setBuildings(data || []);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchPublicBuildings();
    }
  }, [isOpen]);

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-orange-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Building Library</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search buildings..."
                  className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Building List */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading public buildings...</p>
                </div>
              ) : filteredBuildings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Info className="h-12 w-12 mx-auto mb-4" />
                  <p>No public buildings found or matching your search.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBuildings.map((building) => (
                    <div key={building.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                        {building.thumbnail_url ? (
                          <img 
                            src={building.thumbnail_url} 
                            alt={building.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building className="h-10 w-10 text-gray-500" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{building.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{building.description}</p>
                      <button
                        onClick={() => onSelectBuilding(building)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Use This</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


