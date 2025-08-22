'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Search,
  Users,
  MapPin,
  Circle,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  land_id: string
  message_type: 'private' | 'community' | 'neighbor'
  content: string
  is_read: boolean
  created_at: string
  sender: Profile
  receiver: Profile
}

interface Conversation {
  participant: Profile
  lastMessage: Message
  unreadCount: number
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [neighbors, setNeighbors] = useState<Profile[]>([])
  const [showNeighbors, setShowNeighbors] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
        await loadConversations(user.id)
        await loadNeighbors(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadConversations = async (userId: string) => {
    try {
      // Get all messages where user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('message_type', 'private')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>()
      
      for (const message of messagesData || []) {
        const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id
        const partner = message.sender_id === userId ? message.receiver : message.sender
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            participant: partner,
            lastMessage: message,
            unreadCount: 0
          })
        }
        
        // Count unread messages
        if (!message.is_read && message.receiver_id === userId) {
          const conv = conversationMap.get(partnerId)!
          conv.unreadCount++
        }
      }

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadNeighbors = async (userId: string) => {
    try {
      // Get user's lands
      const { data: userLands, error: landsError } = await supabase
        .from('lands')
        .select('latitude, longitude')
        .eq('owner_id', userId)
        .eq('is_owned', true)

      if (landsError) throw landsError

      if (!userLands || userLands.length === 0) {
        setNeighbors([])
        return
      }

      // Find neighbors within a certain distance
      const neighborProfiles = new Set<Profile>()
      
      for (const userLand of userLands) {
        const { data: nearbyLands, error: nearbyError } = await supabase
          .from('lands')
          .select(`
            owner_id,
            profiles!lands_owner_id_fkey(*)
          `)
          .eq('is_owned', true)
          .neq('owner_id', userId)
          .gte('latitude', userLand.latitude - 2)
          .lte('latitude', userLand.latitude + 2)
          .gte('longitude', userLand.longitude - 2)
          .lte('longitude', userLand.longitude + 2)

        if (nearbyError) throw nearbyError

        for (const land of nearbyLands || []) {
            if (land.profiles) {
              // Ensure land.profiles is treated as a single Profile object
              // Supabase 'single' relationship should return a single object or null
              neighborProfiles.add(land.profiles as Profile);
            }
        }
      }

      setNeighbors(Array.from(neighborProfiles))
    } catch (error) {
      console.error('Error loading neighbors:', error)
    }
  }

  const loadMessages = async (conversationPartnerId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationPartnerId}),and(sender_id.eq.${conversationPartnerId},receiver_id.eq.${user.id})`)
        .eq('message_type', 'private')
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversationPartnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.participant.id,
          message_type: 'private',
          content: newMessage,
          is_read: false
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .single()

      if (error) throw error

      setMessages(prev => [...prev, data])
      setNewMessage('')

      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.participant.id === selectedConversation.participant.id
          ? { ...conv, lastMessage: data }
          : conv
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const startConversation = async (neighbor: Profile) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.participant.id === neighbor.id)
    
    if (existingConv) {
      setSelectedConversation(existingConv)
      await loadMessages(neighbor.id)
    } else {
      // Create new conversation
      const newConv: Conversation = {
        participant: neighbor,
        lastMessage: null as any,
        unreadCount: 0
      }
      setSelectedConversation(newConv)
      setMessages([])
    }
    
    setShowNeighbors(false)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Mars Messaging</h2>
          <p className="text-gray-300 mb-6">Please sign in to message your Mars neighbors.</p>
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
              <MessageSquare className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mars Messages</h1>
                <p className="text-gray-300">Connect with your neighbors</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/community"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Community
              </a>
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          {/* Search and Actions */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={() => setShowNeighbors(!showNeighbors)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Find Neighbors ({neighbors.length})</span>
            </button>
          </div>

          {/* Neighbors List */}
          {showNeighbors && (
            <div className="p-4 border-b border-gray-700 bg-gray-900/30">
              <h3 className="text-white font-semibold mb-3">Nearby Neighbors</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {neighbors.length === 0 ? (
                  <p className="text-gray-400 text-sm">No neighbors found. Buy land to find neighbors!</p>
                ) : (
                  neighbors.map((neighbor) => (
                    <button
                      key={neighbor.id}
                      onClick={() => startConversation(neighbor)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {neighbor.full_name?.charAt(0) || neighbor.email?.charAt(0) || 'N'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {neighbor.full_name || neighbor.email}
                        </p>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400 text-xs">Nearby neighbor</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No conversations yet</p>
                <p className="text-gray-500 text-sm">Start chatting with your neighbors!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.participant.id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    loadMessages(conversation.participant.id)
                  }}
                  className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 ${
                    selectedConversation?.participant.id === conversation.participant.id
                      ? 'bg-gray-700/50'
                      : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {conversation.participant.full_name?.charAt(0) || conversation.participant.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">
                        {conversation.participant.full_name || conversation.participant.email}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">
                      {conversation.lastMessage?.content || 'Start a conversation'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {conversation.lastMessage?.created_at 
                        ? new Date(conversation.lastMessage.created_at).toLocaleDateString()
                        : ''
                      }
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a neighbor to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gray-800/50 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedConversation.participant.full_name?.charAt(0) || selectedConversation.participant.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {selectedConversation.participant.full_name || selectedConversation.participant.email}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Circle className="h-2 w-2 text-green-500 fill-current" />
                        <span className="text-gray-400 text-sm">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-white transition-colors p-2">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors p-2">
                      <Video className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors p-2">
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user.id ? 'text-orange-100' : 'text-gray-400'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-gray-800/50 border-t border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage()
                      }
                    }}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

