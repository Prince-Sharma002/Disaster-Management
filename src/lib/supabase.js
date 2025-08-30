// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ffndofhuvyhtzuqbvwws.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbmRvZmh1dnlodHp1cWJ2d3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDkzNzYsImV4cCI6MjA3MjEyNTM3Nn0.9_koL4Vrhfx4dWgbbATHWXWJpFcRxDWoQGTa3t8CKKo'

const supabase = createClient(supabaseUrl, supabaseKey)

// Polygon database operations
const polygonService = {
  // Fetch all polygons
  async getPolygons() {
    try {
      const { data, error } = await supabase
        .from('polygons')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching polygons:', error)
      return []
    }
  },

  // Create new polygon
  async createPolygon(polygonData) {
    try {
      const { data, error } = await supabase
        .from('polygons')
        .insert([polygonData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating polygon:', error)
      throw error
    }
  },

  // Update polygon
  async updatePolygon(id, updates) {
    try {
      const { data, error } = await supabase
        .from('polygons')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating polygon:', error)
      throw error
    }
  },

  // Delete polygon
  async deletePolygon(id) {
    try {
      const { error } = await supabase
        .from('polygons')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting polygon:', error)
      throw error
    }
  },

  // Upload image to Supabase Storage
  async uploadImage(file, fileName) {
    try {
      const { data, error } = await supabase.storage
        .from('polygon-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('polygon-images')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  // Delete image from storage
  async deleteImage(fileName) {
    try {
      const { error } = await supabase.storage
        .from('polygon-images')
        .remove([fileName])
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }
}

export { supabase, polygonService }
