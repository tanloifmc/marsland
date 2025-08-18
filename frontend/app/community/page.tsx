'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Send,
  Users,
  MapPin,
  Calendar,
  Pin,
  Image,
  Smile,
  MoreHorizontal
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

interface CommunityPost {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  author: Profile
}

interface PostComment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author: Profile
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [comments, setComments] = useState<{ [postId: string]: PostComment[] }>({})
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newCommentContent, setNewCommentContent] = useState<{ [postId: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({})
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
        await loadCommunityPosts()
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

  const loadCommunityPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])

      // Load comments for each post
      for (const post of data || []) {
        await loadPostComments(post.id)
      }
    } catch (error) {
      console.error('Error loading community posts:', error)
    }
  }

  const loadPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(prev => ({ ...prev, [postId]: data || [] }))
    } catch (error) {
      console.error('Error loading post comments:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          title: newPostTitle,
          content: newPostContent,
          likes_count: 0,
          comments_count: 0,
          is_pinned: false
        })
        .select(`
          *,
          author:profiles(*)
        `)
        .single()

      if (error) throw error

      setPosts(prev => [data, ...prev])
      setNewPostTitle('')
      setNewPostContent('')
      setShowCreatePost(false)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !newCommentContent[postId]?.trim()) return

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newCommentContent[postId]
        })
        .select(`
          *,
          author:profiles(*)
        `)
        .single()

      if (error) throw error

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }))

      // Update comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ))

      setNewCommentContent(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ))
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) throw error

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Mars Community...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Join the Mars Community</h2>
          <p className="text-gray-300 mb-6">Please sign in to connect with fellow Mars colonists.</p>
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
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mars Community Center</h1>
                <p className="text-gray-300">Connect with fellow colonists</p>
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
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Mars Explorer
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Create Post Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">
                {profile?.full_name || profile?.email || 'Mars Colonist'}
              </p>
              <p className="text-gray-400 text-sm">Share your Mars experience</p>
            </div>
          </div>

          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>What's happening on Mars?</span>
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Post title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
              />
              <textarea
                placeholder="Share your thoughts about life on Mars..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Image className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MapPin className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowCreatePost(false)
                      setNewPostTitle('')
                      setNewPostContent('')
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Colonists</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Community Posts</p>
                <p className="text-2xl font-bold text-white">{posts.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Interactions</p>
                <p className="text-2xl font-bold text-white">
                  {posts.reduce((sum, post) => sum + post.likes_count + post.comments_count, 0)}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
              <p className="text-gray-400 mb-6">
                Be the first to share your Mars experience with the community!
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create First Post</span>
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {post.author?.full_name?.charAt(0) || post.author?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {post.author?.full_name || post.author?.email || 'Mars Colonist'}
                        </p>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.is_pinned && (
                            <>
                              <span>•</span>
                              <Pin className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-500">Pinned</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                        <span>{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{post.comments_count}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors">
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[post.id] && (
                  <div className="border-t border-gray-700 bg-gray-900/30">
                    {/* Add Comment */}
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newCommentContent[post.id] || ''}
                            onChange={(e) => setNewCommentContent(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id)
                              }
                            }}
                            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newCommentContent[post.id]?.trim()}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="p-4 space-y-4">
                      {(comments[post.id] || []).map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {comment.author?.full_name?.charAt(0) || comment.author?.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-700/50 rounded-lg p-3">
                              <p className="text-white text-sm font-semibold mb-1">
                                {comment.author?.full_name || comment.author?.email || 'Mars Colonist'}
                              </p>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

