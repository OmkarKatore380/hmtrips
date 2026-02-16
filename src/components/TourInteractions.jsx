import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { syncUserCRM, ensureTourInteractionFields } from '../lib/firestore'
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from 'firebase/firestore'

export default function TourInteractions({ tour }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(tour.likes || 0)
  const [saveCount, setSaveCount] = useState(tour.saves || 0)
  const [shareCount, setShareCount] = useState(tour.shares || 0)
  const [viewCount, setViewCount] = useState(tour.views || tour.viewing || 0)
  const [viewRecorded, setViewRecorded] = useState(false)

  useEffect(() => {
    setLikeCount(tour.likes || 0)
    setSaveCount(tour.saves || 0)
    setShareCount(tour.shares || 0)
    setViewCount(tour.views || tour.viewing || 0)
    setViewRecorded(false)
    
    // Ensure tour has interaction fields initialized
    if (tour?.id) {
      ensureTourInteractionFields(tour.id, tour)
    }
  }, [tour.id, tour.likes, tour.saves, tour.shares, tour.views, tour.viewing])

  const incrementTourField = async (field, delta = 1) => {
    if (!tour?.id) return
    try {
      await updateDoc(doc(db, 'tours', tour.id), {
        [field]: increment(delta),
      })
    } catch (_) {}
  }

  // Load existing status from Firebase on mount
  useEffect(() => {
    if (!user) return
    const checkStatus = async () => {
      // Check Wishlist
      const savedDoc = await getDoc(doc(db, 'wishlist', `${user.uid}_${tour.id}`))
      if (savedDoc.exists()) setSaved(true)

      // Check Interactions (Like/Dislike)
      const interactionDoc = await getDoc(doc(db, 'interactions', `${user.uid}_${tour.id}`))
      if (interactionDoc.exists()) {
        const data = interactionDoc.data()
        if (data.type === 'like') {
          setLiked(true)
          setDisliked(false)
        } else if (data.type === 'dislike') {
          setDisliked(true)
          setLiked(false)
        }
      }
    }
    checkStatus()
  }, [user, tour.id])

  useEffect(() => {
    if (viewRecorded || !tour?.id) return
    setViewRecorded(true)
    setViewCount((v) => v + 1)
    incrementTourField('views', 1)
  }, [tour.id, viewRecorded])

  // Logic: Clicking Like removes Dislike
  const handleLike = async () => {
    if (!user) return alert("Please login to like")
    const ref = doc(db, 'interactions', `${user.uid}_${tour.id}`)
    
    if (liked) {
      await deleteDoc(ref)
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
      incrementTourField('likes', -1)
    } else {
      await setDoc(ref, { userId: user.uid, tourId: tour.id, type: 'like' })
      setLiked(true)
      setDisliked(false)
      setLikeCount((c) => c + 1)
      incrementTourField('likes', 1)

      syncUserCRM(user.uid, { 
        sentiment: 'like', 
        tourName: tour.name, 
        category: tour.category || 'general' 
      })
    }
  }

  // Logic: Clicking Dislike removes Like
  const handleDislike = async () => {
    if (!user) return alert("Please login to dislike")
    const ref = doc(db, 'interactions', `${user.uid}_${tour.id}`)
    
    if (disliked) {
      await deleteDoc(ref)
      setDisliked(false)
    } else {
      await setDoc(ref, { userId: user.uid, tourId: tour.id, type: 'dislike' })
      setDisliked(true)
      setLiked(false) // Toggle UI off for like

      // ADDED CRM SYNC
      syncUserCRM(user.uid, { 
        sentiment: 'dislike', 
        tourName: tour.name, 
        category: tour.category || 'general' 
      })
    }
  }

  const handleSave = async () => {
    if (!user) return alert("Please login to save")
    const ref = doc(db, 'wishlist', `${user.uid}_${tour.id}`)
    if (saved) {
      await deleteDoc(ref)
      setSaved(false)
      setSaveCount((c) => Math.max(0, c - 1))
      incrementTourField('saves', -1)
    } else {
      await setDoc(ref, { userId: user.uid, ...tour })
      setSaved(true)
      setSaveCount((c) => c + 1)
      incrementTourField('saves', 1)

      syncUserCRM(user.uid, { 
        action: 'save', 
        tourName: tour.name, 
        category: tour.category || 'general' 
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.origin + `/itinerary/${tour.id}`
    
    if (user?.uid) {
      syncUserCRM(user.uid, { 
        action: 'share', 
        tourName: tour.name, 
        category: tour.category || 'general' 
      })
    }

    setShareCount((c) => c + 1)
    incrementTourField('shares', 1)

    try {
      if (navigator.share) {
        await navigator.share({ title: tour.name, url })
      } else {
        throw new Error()
      }
    } catch (err) {
      navigator.clipboard.writeText(url)
      alert("Link copied!")
    }
  }

  return (
    <div className="flex items-center justify-between py-1 border-t border-neutral-100">
      <div className="flex items-center">
        {/* Like Button */}
        <button onClick={handleLike} className="p-4 active:scale-90 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="ml-1 text-xs font-semibold text-neutral-600">{likeCount}</span>
        </button>

        {/* Dislike Button - COMMENTED OUT
        <button onClick={handleDislike} className="p-4 active:scale-90 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={disliked ? "#000" : "none"} stroke={disliked ? "#000" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7L2 11c0 1.1.9 2 2 2h9.93L10 15z"></path>
          </svg>
        </button> 
        */}

        {/* View Count */}
        <div className="flex items-center gap-1.5 px-2 text-neutral-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="text-sm font-bold">{viewCount}</span>
        </div>
      </div>

      <div className="flex items-center">
        {/* Share */}
        <button onClick={handleShare} className="p-4 active:scale-90 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        {/* Save */}
        <button onClick={handleSave} className="p-4 active:scale-90 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "#2563eb" : "none"} stroke={saved ? "#2563eb" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="ml-1 text-xs font-semibold text-neutral-600">{saveCount}</span>
        </button>
      </div>
    </div>
  )
}
