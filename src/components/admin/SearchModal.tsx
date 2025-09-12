"use client";
import { useState } from "react";
import { Search, Image, Video, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data untuk search results
const mockSearchResults = [
  {
    id: 1,
    name: "face_swap_result_001.jpg",
    type: "image",
    size: "2.4 MB",
    date: "2 hours ago",
    thumbnail: "/placeholder-image.jpg",
  },
  {
    id: 2,
    name: "celebrity_swap.mp4",
    type: "video",
    size: "15.7 MB",
    date: "1 day ago",
    thumbnail: "/placeholder-video.jpg",
  },
  {
    id: 3,
    name: "group_photo_swap.png",
    type: "image",
    size: "4.1 MB",
    date: "3 days ago",
    thumbnail: "/placeholder-image2.jpg",
  },
  {
    id: 4,
    name: "final_edit_v2.jpg",
    type: "image",
    size: "1.8 MB",
    date: "1 week ago",
    thumbnail: "/placeholder-image3.jpg",
  },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = mockSearchResults.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "video":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-black border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Search Media</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search images and videos..."
            className="pl-12 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery ? (
            filteredResults.length > 0 ? (
              <div className="space-y-2">
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium truncate">{item.name}</span>
                        <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                          {item.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No results found for {searchQuery}</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>Start typing to search your media files</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
