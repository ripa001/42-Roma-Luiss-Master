# 🎥 Trick42 Video Platform - Guida Implementazione

## 📋 **PANORAMICA**

Questa guida spiega come implementare la piattaforma video per il sistema Trick42 Token, permettendo agli skater di caricare video e ai validatori di valutarli per assegnare token.

---

## 🏗️ **ARCHITETTURA DELLA PIATTAFORMA**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React/Vue)   │◄──►│   (Node.js)     │◄──►│   (Smart       │
│                 │    │                 │    │    Contract)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Video Storage │    │   Database      │    │   Events Log    │
│   (IPFS/YouTube)│    │   (MongoDB)     │    │   (Blockchain)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 💻 **IMPLEMENTAZIONE FRONTEND**

### Componente Upload Video (React)

```jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS, uploadToYouTube } from '../services/videoUpload';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [trickType, setTrickType] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return;

    setUploading(true);
    try {
      // 1. Upload video to storage platforms
      const ipfsHash = await uploadToIPFS(video);
      const youtubeUrl = await uploadToYouTube(video, {
        title: `${trickType} - Trick42 Submission`,
        description: `Skateboard trick submission for validation`
      });

      // 2. Connect to smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      // 3. Submit to blockchain
      const tx = await contract.submitVideo(
        ipfsHash,
        youtubeUrl,
        trickType,
        difficulty
      );

      await tx.wait();
      alert('Video submitted successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to submit video');
    }
    setUploading(false);
  };

  return (
    <div className="video-upload">
      <h2>Submit Your Trick Video</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Video File:</label>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
          />
        </div>
        
        <div>
          <label>Trick Type:</label>
          <select value={trickType} onChange={(e) => setTrickType(e.target.value)}>
            <option value="">Select Trick</option>
            <option value="kickflip">Kickflip</option>
            <option value="heelflip">Heelflip</option>
            <option value="tre-flip">Tre Flip</option>
            <option value="backside-180">Backside 180</option>
            <option value="frontside-180">Frontside 180</option>
            <option value="ollie">Ollie</option>
          </select>
        </div>
        
        <div>
          <label>Claimed Difficulty (1-10):</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
          <span>{difficulty}</span>
        </div>
        
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
```

### Componente Validazione Video (React)

```jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const VideoValidation = () => {
  const [pendingVideos, setPendingVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [finalDifficulty, setFinalDifficulty] = useState(5);
  const [validationNotes, setValidationNotes] = useState('');

  useEffect(() => {
    loadPendingVideos();
  }, []);

  const loadPendingVideos = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const videos = await contract.getPendingVideos(0, 20);
      
      // Format data for display
      const formattedVideos = videos.videoIds.map((id, index) => ({
        id: id.toString(),
        skater: videos.skaters[index],
        trickType: videos.trickTypes[index],
        claimedDifficulty: videos.difficulties[index].toString()
      }));
      
      setPendingVideos(formattedVideos);
    } catch (error) {
      console.error('Failed to load pending videos:', error);
    }
  };

  const validateVideo = async (approve) => {
    if (!currentVideo) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      let tx;
      if (approve) {
        tx = await contract.validateVideo(
          currentVideo.id,
          finalDifficulty,
          validationNotes
        );
      } else {
        tx = await contract.rejectVideo(
          currentVideo.id,
          validationNotes || 'Trick not performed correctly'
        );
      }

      await tx.wait();
      alert(approve ? 'Video approved!' : 'Video rejected!');
      
      // Reload pending videos
      loadPendingVideos();
      setCurrentVideo(null);
      
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const loadVideoDetails = async (videoId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const videoDetails = await contract.getVideoSubmission(videoId);
      setCurrentVideo({
        id: videoId,
        skater: videoDetails.skater,
        videoHash: videoDetails.videoHash,
        videoUrl: videoDetails.videoUrl,
        trickType: videoDetails.trickType,
        claimedDifficulty: videoDetails.claimedDifficulty.toString(),
        timestamp: new Date(videoDetails.timestamp.toNumber() * 1000)
      });
    } catch (error) {
      console.error('Failed to load video details:', error);
    }
  };

  return (
    <div className="video-validation">
      <h2>Video Validation Dashboard</h2>
      
      <div className="pending-videos">
        <h3>Pending Videos ({pendingVideos.length})</h3>
        {pendingVideos.map((video) => (
          <div key={video.id} className="video-item">
            <span>{video.trickType}</span>
            <span>by {video.skater.slice(0, 8)}...</span>
            <span>Claimed: {video.claimedDifficulty}/10</span>
            <button onClick={() => loadVideoDetails(video.id)}>
              Review
            </button>
          </div>
        ))}
      </div>

      {currentVideo && (
        <div className="video-review">
          <h3>Review Video</h3>
          <div className="video-details">
            <p><strong>Skater:</strong> {currentVideo.skater}</p>
            <p><strong>Trick:</strong> {currentVideo.trickType}</p>
            <p><strong>Claimed Difficulty:</strong> {currentVideo.claimedDifficulty}/10</p>
            <p><strong>Submitted:</strong> {currentVideo.timestamp.toLocaleString()}</p>
          </div>
          
          <div className="video-player">
            <iframe
              width="560"
              height="315"
              src={currentVideo.videoUrl.replace('watch?v=', 'embed/')}
              title="Trick Video"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          
          <div className="validation-controls">
            <div>
              <label>Final Difficulty (1-10):</label>
              <input
                type="range"
                min="1"
                max="10"
                value={finalDifficulty}
                onChange={(e) => setFinalDifficulty(e.target.value)}
              />
              <span>{finalDifficulty}</span>
            </div>
            
            <div>
              <label>Validation Notes:</label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Optional feedback for the skater..."
              />
            </div>
            
            <div className="buttons">
              <button 
                className="approve"
                onClick={() => validateVideo(true)}
              >
                Approve & Mint Tokens
              </button>
              <button 
                className="reject"
                onClick={() => validateVideo(false)}
              >
                Reject Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoValidation;
```

---

## 🛠️ **SERVIZI BACKEND**

### Upload IPFS Service

```javascript
// services/ipfsUpload.js
import { create } from 'ipfs-http-client';

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
    ).toString('base64')}`
  }
});

export const uploadToIPFS = async (file) => {
  try {
    const result = await ipfs.add(file);
    return result.path; // Returns IPFS hash
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw error;
  }
};

export const getIPFSUrl = (hash) => {
  return `https://trick42.infura-ipfs.io/ipfs/${hash}`;
};
```

### YouTube Upload Service

```javascript
// services/youtubeUpload.js
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export const uploadToYouTube = async (videoFile, metadata) => {
  try {
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: ['skateboard', 'trick42', 'blockchain', 'validation'],
          categoryId: '17' // Sports category
        },
        status: {
          privacyStatus: 'unlisted' // Public but not searchable
        }
      },
      media: {
        body: videoFile
      }
    });

    return `https://youtube.com/watch?v=${response.data.id}`;
  } catch (error) {
    console.error('YouTube upload failed:', error);
    throw error;
  }
};
```

### Database Schema (MongoDB)

```javascript
// models/VideoSubmission.js
const mongoose = require('mongoose');

const videoSubmissionSchema = new mongoose.Schema({
  videoId: { type: Number, required: true, unique: true },
  skaterAddress: { type: String, required: true },
  videoHash: { type: String, required: true },
  videoUrl: { type: String, required: true },
  trickType: { type: String, required: true },
  claimedDifficulty: { type: Number, required: true, min: 1, max: 10 },
  submissionTimestamp: { type: Date, required: true },
  
  // Validation data
  isValidated: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  validatorAddress: { type: String },
  finalDifficulty: { type: Number, min: 1, max: 10 },
  validationNotes: { type: String },
  validationTimestamp: { type: Date },
  
  // Metadata
  fileSize: { type: Number },
  duration: { type: Number },
  quality: { type: String }, // 720p, 1080p, etc.
  
  // Social features
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: [{ 
    address: String, 
    text: String, 
    timestamp: Date 
  }]
});

module.exports = mongoose.model('VideoSubmission', videoSubmissionSchema);
```

---

## 🔧 **CONFIGURAZIONE E DEPLOYMENT**

### Environment Variables (.env)

```env
# Blockchain
REACT_APP_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=...
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# IPFS
INFURA_PROJECT_ID=...
INFURA_PROJECT_SECRET=...

# YouTube
YOUTUBE_API_KEY=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# Database
MONGODB_URI=mongodb://localhost:27017/trick42

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=trick42-videos
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ipfs:
    image: ipfs/go-ipfs:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs_data:/data/ipfs

volumes:
  mongo_data:
  ipfs_data:
```

---

## 📱 **MOBILE APP (React Native)**

### Video Recording Component

```jsx
// components/VideoRecorder.js
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';

const VideoRecorder = ({ onVideoRecorded }) => {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const options = {
        quality: RNCamera.Constants.VideoQuality['720p'],
        maxDuration: 60, // 60 seconds max
        maxFileSize: 100 * 1024 * 1024, // 100MB max
      };
      
      try {
        const data = await cameraRef.current.recordAsync(options);
        onVideoRecorded(data.uri);
      } catch (error) {
        console.error('Recording failed:', error);
      }
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={RNCamera.Constants.Type.back}
        captureAudio={true}
      />
      
      <View style={{ position: 'absolute', bottom: 50, alignSelf: 'center' }}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: recording ? 'red' : 'white',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text>{recording ? 'Stop' : 'Record'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VideoRecorder;
```

---

## 🚀 **DEPLOYMENT E MONITORAGGIO**

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Trick42 Platform

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy smart contracts
          npm run deploy:mainnet
          
          # Deploy frontend
          npm run build
          aws s3 sync build/ s3://${{ secrets.S3_BUCKET }}
          
          # Deploy backend
          docker build -t trick42-api .
          docker push ${{ secrets.DOCKER_REGISTRY }}/trick42-api
```

### Monitoring e Analytics

```javascript
// services/analytics.js
export const trackVideoSubmission = (videoId, skater, trickType) => {
  // Track with Google Analytics
  gtag('event', 'video_submission', {
    video_id: videoId,
    skater_address: skater,
    trick_type: trickType
  });
  
  // Track with Mixpanel
  mixpanel.track('Video Submitted', {
    videoId,
    skater,
    trickType,
    timestamp: new Date()
  });
};

export const trackValidation = (videoId, validator, approved, tokensAwarded) => {
  gtag('event', 'video_validation', {
    video_id: videoId,
    validator_address: validator,
    approved,
    tokens_awarded: tokensAwarded
  });
  
  mixpanel.track('Video Validated', {
    videoId,
    validator,
    approved,
    tokensAwarded,
    timestamp: new Date()
  });
};
```

---

## 🎯 **PROSSIMI PASSI**

1. **Implementare il frontend** con React/Vue.js
2. **Configurare storage** IPFS e backup cloud
3. **Sviluppare API backend** per gestione video
4. **Testare integrazione** con smart contract
5. **Deploy su testnet** per test pubblici
6. **Raccogliere feedback** dalla community
7. **Ottimizzare performance** e UX
8. **Launch su mainnet** 🚀

Questa implementazione crea un ecosistema completo dove gli skater possono facilmente caricare video dei loro trick e i validatori possono valutarli in modo efficiente, il tutto supportato dalla trasparenza e sicurezza della blockchain!
