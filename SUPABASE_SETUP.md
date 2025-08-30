# Supabase Integration Setup Guide

## Step-by-Step Implementation Process

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 3. Create Database Table
Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE polygons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#088888',
  area DECIMAL NOT NULL,
  coordinates JSONB NOT NULL,
  geometry JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE polygons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations" ON polygons FOR ALL USING (true);
```

### 4. Create Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `polygon-images`
3. Make it public for easier access
4. Set appropriate policies

### 5. Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Features Implemented

#### Polygon Storage:
- **Name**: User-defined polygon name
- **Color**: 8 predefined color options
- **Area**: Automatically calculated using Turf.js
- **Coordinates**: Raw coordinate data
- **Geometry**: Complete GeoJSON geometry
- **Image**: Optional image upload to Supabase Storage
- **Timestamp**: Automatic creation time

#### Map Display:
- Polygons are fetched on map load
- Each polygon displays with its selected color
- Click polygons to see popup with details
- Images are displayed in popups if uploaded

#### User Interface:
- Enhanced modal with color picker
- Image upload with preview
- Loading states during save
- Error handling for failed operations

### 7. File Structure
```
src/
├── lib/
│   └── supabase.js          # Supabase client and services
├── components/
│   ├── Map.jsx              # Main map component (refactored)
│   ├── PolygonModal.jsx     # Enhanced with color picker
│   ├── Sidebar.jsx          # Sidebar component
│   ├── SearchBox.jsx        # Search functionality
│   ├── LayerControls.jsx    # Map layer controls
│   └── MapControls.jsx      # Zoom controls
└── hooks/
    └── useMapbox.js         # Map initialization logic
```

### 8. Data Flow
1. User draws polygon on map
2. Modal opens with form fields
3. User enters name, selects color, uploads image
4. Data is saved to Supabase database
5. Image is uploaded to Supabase Storage
6. Polygon appears on map with selected color
7. All polygons are fetched and displayed on map load

### 9. Next Steps
- Replace Firebase imports with Supabase
- Test the complete flow
- Add polygon editing/deletion features
- Implement real-time updates with Supabase subscriptions
