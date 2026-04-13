'use client';
import React, { useState } from 'react';
import { MapPin, Clock, Star, Users, Zap, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StadiumCardProps {
  id: string;
  image?: string;
  name?: string;
  pricePerMatch?: number;
  location?: string;
  workingHours?: {
    start: string;
    end: string;
  };
}

const StadiumCard = ({
  id,
  image,
  name = "Unnamed Stadium",
  pricePerMatch,
  location = "Unknown Location",
  workingHours = { start: "00:00", end: "00:00" }
}: StadiumCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const price = pricePerMatch !== undefined ? pricePerMatch : "N/A";

  // Generate a random rating for demonstration (in real app, this would come from data)
  const rating = (4.2 + Math.random() * 0.7).toFixed(1);
  const reviewCount = Math.floor(50 + Math.random() * 200);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError || !image) {
      return '/images/grid-image/image-01.png'; // fallback image
    }
    return image?.startsWith('http') ? image : `http://localhost:8080/${image}`;
  };

  return (
    <div className="group relative bg-white dark:bg-stone-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-stone-700 hover:border-blue-200 dark:hover:border-blue-600/30 overflow-hidden max-w-md w-full">
      {/* Enhanced Image Section */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
        <Image
          src={getImageSrc()}
          alt={name}
          width={400}
          height={250}
          loading="lazy"
          onError={handleImageError}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Enhanced Status Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="flex items-center bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Available
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 left-4 z-20 p-2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Heart 
            className={`h-5 w-5 transition-colors duration-300 ${
              isLiked 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600 dark:text-stone-400 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">{rating}</span>
          <span className="text-xs text-gray-600 dark:text-stone-400 ml-1">({reviewCount})</span>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6 relative">
        {/* Enhanced Title */}
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {name}
        </h3>

        {/* Enhanced Price Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-black text-green-600 dark:text-green-400">{price}</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-1">LBP</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-stone-400 font-medium">/per match</span>
        </div>

        {/* Enhanced Info Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-stone-700/50 rounded-xl transition-colors duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-stone-300 truncate">{location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-stone-700/50 rounded-xl transition-colors duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-stone-300">
                {workingHours?.start || "?"} - {workingHours?.end || "?"}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400 mr-1" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Fast Booking</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Users className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">22 Players</span>
          </div>
        </div>

        {/* Enhanced Book Button */}
        <Link href={`/stadiums/${id}`} className="block group/btn">
          <button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center">
              Book Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </Link>
      </div>

      {/* Enhanced Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
    </div>
  );
};

export default StadiumCard;
