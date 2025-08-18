'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Edit3,
  Save,
  X,
  Upload,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  BookOpen,
  Calendar,
  MapPin,
  Home,
  Building,
  Award,
  Camera
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  music_url: string
  diary: string
  created_at: string
  updated_at: string
}

interface UserStats {
  landsOwned: number
  buildingsBuilt: number
  communityPosts: number
  certificatesIssued: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    landsOwned: 0,
    buildingsBuilt: 0,
    communityPosts: 0,
    certificatesIssued: 0
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
        await loadUserStats(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [profile?.music_url])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadUserStats = async (userId: string) => {
    try {
      // Load lands owned
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('id')
        .eq('owner_id', userId)
        .eq('is_owned', true)

      // Load buildings built
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id')
        .eq('owner_id', userId)

      // Load community posts
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('id')
        .eq('author_id', userId)

      // Load certificates issued
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select('id')
        .eq('owner_id', userId)
        .eq('status', 'issued')

      setUserStats({
        landsOwned: lands?.length || 0,
        buildingsBuilt: buildings?.length || 0,
        communityPosts: posts?.length || 0,
        certificatesIssued: certificates?.length || 0
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          bio: editedProfile.bio,
          music_url: editedProfile.music_url,
          diary: editedProfile.diary,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, ...editedProfile })
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      setEditedProfile(prev => ({ ...prev, avatar_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Mars Profile</h2>
          <p className="text-gray-300 mb-6">Please sign in to view your profile.</p>
          <a
            href="/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mars Profile</h1>
                <p className="text-gray-300">Your colonist identity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/community"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Community
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 sticky top-8"
            >
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={editedProfile.full_name || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={editedProfile.username || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {profile?.full_name || 'Mars Colonist'}
                    </h2>
                    <p className="text-gray-400 mb-2">@{profile?.username || 'colonist'}</p>
                    <p className="text-gray-500 text-sm">{profile?.email}</p>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Bio
                </h3>
                {editing ? (
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                  />
                ) : (
                  <p className="text-gray-300 text-sm">
                    {profile?.bio || 'No bio yet. Share something about yourself!'}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-lg p-3 text-center">
                  <Home className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{userStats.landsOwned}</p>
                  <p className="text-gray-400 text-xs">Lands Owned</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-lg p-3 text-center">
                  <Building className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{userStats.buildingsBuilt}</p>
                  <p className="text-gray-400 text-xs">Buildings</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-lg p-3 text-center">
                  <User className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{userStats.communityPosts}</p>
                  <p className="text-gray-400 text-xs">Posts</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <Award className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{userStats.certificatesIssued}</p>
                  <p className="text-gray-400 text-xs">Certificates</p>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setEditedProfile(profile || {})
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Music Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music className="h-6 w-6 mr-2 text-orange-500" />
                Mars Soundtrack
              </h3>
              
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="url"
                    placeholder="Music URL (MP3, etc.)"
                    value={editedProfile.music_url || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, music_url: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-gray-400 text-sm">Share your favorite Mars exploration music!</p>
                </div>
              ) : (
                <div>
                  {profile?.music_url ? (
                    <div className="space-y-4">
                      <audio
                        ref={audioRef}
                        src={profile.music_url}
                        onLoadedMetadata={() => {
                          const audio = audioRef.current
                          if (audio) {
                            setDuration(audio.duration)
                            audio.volume = volume
                          }
                        }}
                      />
                      
                      {/* Player Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={togglePlayPause}
                          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </button>
                        
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-gray-400 text-sm mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleMute}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Music className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No music added yet</p>
                      <p className="text-gray-500 text-sm">Add your Mars exploration soundtrack!</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Mars Diary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-orange-500" />
                Mars Diary
              </h3>
              
              {editing ? (
                <div className="space-y-4">
                  <textarea
                    placeholder="Write about your Mars adventures, discoveries, and daily life..."
                    value={editedProfile.diary || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, diary: e.target.value }))}
                    rows={12}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                  />
                  <p className="text-gray-400 text-sm">Document your Mars colonization journey!</p>
                </div>
              ) : (
                <div>
                  {profile?.diary ? (
                    <div className="bg-gray-900/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">
                          Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {profile.diary}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-white mb-2">Start Your Mars Diary</h4>
                      <p className="text-gray-400 mb-6">
                        Document your journey as a Mars colonist. Share your experiences, discoveries, and daily life on the Red Planet.
                      </p>
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                      >
                        <Edit3 className="h-5 w-5" />
                        <span>Start Writing</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Profile ID</p>
                  <p className="text-white font-mono text-sm">{profile?.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Last Updated</p>
                  <p className="text-white">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

