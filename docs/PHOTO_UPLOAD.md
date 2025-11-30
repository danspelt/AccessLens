# Photo Upload System with GridFS

AccessLens uses MongoDB GridFS to store photos directly in the database, eliminating the need for external storage services like S3.

## Architecture

### Storage
- **GridFS Bucket**: `photos` (creates `photos.files` and `photos.chunks` collections)
- **Location**: All photos stored in MongoDB alongside your data
- **Max File Size**: 10MB per photo
- **Max Photos**: 5 photos per review

### Flow

1. **Upload**: User selects photos in review form → Photos uploaded to GridFS → File IDs stored in review
2. **Retrieval**: Frontend requests `/api/photos/:id` → GridFS streams photo → Browser displays image

## API Endpoints

### POST `/api/places/[id]/reviews`
Creates a review with optional photo uploads.

**Request Format**: `multipart/form-data`

**Fields**:
- `rating` (number, 1-5)
- `comment` (string, required)
- `photos` (File[], optional, max 5)

**Response**:
```json
{
  "review": {
    "id": "...",
    "placeId": "...",
    "rating": 5,
    "comment": "...",
    "photoIds": ["photo_id_1", "photo_id_2"]
  }
}
```

### GET `/api/photos/:id`
Retrieves a photo from GridFS by ID.

**Response**: Image binary with appropriate Content-Type header

**Usage**:
```html
<img src="/api/photos/507f1f77bcf86cd799439011" alt="Review photo" />
```

## Frontend Usage

### Review Form with Photos

```tsx
const formData = new FormData();
formData.append('rating', '5');
formData.append('comment', 'Great place!');
photos.forEach(photo => {
  formData.append('photos', photo);
});

const response = await fetch(`/api/places/${placeId}/reviews`, {
  method: 'POST',
  body: formData, // Don't set Content-Type header
});
```

### Displaying Photos

```tsx
{review.photoIds?.map((photoId) => (
  <img 
    key={photoId}
    src={`/api/photos/${photoId}`} 
    alt="Review photo"
    loading="lazy"
  />
))}
```

## Database Schema

### Review Model
```typescript
{
  photoIds: string[]; // GridFS file IDs
  // ... other fields
}
```

### GridFS Collections
- `photos.files`: Metadata (filename, contentType, uploadDate, etc.)
- `photos.chunks`: Binary data chunks

## Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name

### File Limits
- Max file size: 10MB (configured in `src/lib/middleware/upload.ts`)
- Max files per review: 5
- Accepted types: `image/*` (JPEG, PNG, GIF, WebP, etc.)

## Migration from URL-based Photos

The system supports both:
- **New**: `photoIds` (GridFS file IDs) - recommended
- **Legacy**: `photoUrls` (external URLs) - for backward compatibility

Reviews can have either `photoIds` or `photoUrls`, and the UI will display both.

## Performance Considerations

1. **Caching**: Photo endpoint sets `Cache-Control: public, max-age=31536000, immutable`
2. **Lazy Loading**: Use `loading="lazy"` on images
3. **Streaming**: Photos are streamed directly from GridFS (no full file in memory)

## Future Enhancements

- Image optimization/thumbnails
- Photo deletion endpoint
- Photo metadata (dimensions, file size)
- Bulk photo operations

