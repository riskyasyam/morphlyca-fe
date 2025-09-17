"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Shield, Star, Check, X } from "lucide-react";
import type { Entitlement } from "@/types/entitlement";

interface EntitlementViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlement: Entitlement | null;
}

const EntitlementViewModal: React.FC<EntitlementViewModalProps> = ({
  open,
  onOpenChange,
  entitlement,
}) => {
  if (!entitlement) return null;

  const getPlanIcon = (planCode: string) => {
    switch (planCode?.toUpperCase()) {
      case 'FREE': return <Shield className="w-5 h-5 text-gray-400" />;
      case 'PREMIUM': return <Star className="w-5 h-5 text-blue-400" />;
      case 'PRO': return <Crown className="w-5 h-5 text-yellow-400" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResolutionColor = (resolution: string) => {
    switch (resolution) {
      case '480p': return 'text-red-400';
      case '720p': return 'text-yellow-400';
      case '1080p': return 'text-green-400';
      case '4K': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-hidden z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlanIcon(entitlement.plan.code)}
            Entitlement Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Plan Info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Plan Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan Name:</span>
                <span className="text-white font-medium">{entitlement.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan Code:</span>
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  {entitlement.plan.code}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  v{entitlement.version}
                </Badge>
              </div>
            </div>
          </div>

          {/* Processing Limits */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Processing Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-700/50 rounded">
                <div className="text-2xl font-bold text-blue-400">
                  {entitlement.entitlements.max_processors_per_job}
                </div>
                <div className="text-xs text-gray-400">Max Processors</div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded">
                <div className="text-2xl font-bold text-green-400">
                  {entitlement.entitlements.max_weight_per_job}
                </div>
                <div className="text-xs text-gray-400">Max Weight</div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded">
                <div className="text-2xl font-bold text-purple-400">
                  {entitlement.entitlements.daily_weight_quota}
                </div>
                <div className="text-xs text-gray-400">Daily Quota</div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded">
                <div className="text-2xl font-bold text-orange-400">
                  {entitlement.entitlements.concurrency}
                </div>
                <div className="text-xs text-gray-400">Concurrency</div>
              </div>
            </div>
          </div>

          {/* Media Limits */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Media Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Video Duration:</span>
                <span className="text-white font-medium">
                  {entitlement.entitlements.max_video_sec} seconds
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Resolution:</span>
                <span className={`font-bold ${getResolutionColor(entitlement.entitlements.max_resolution)}`}>
                  {entitlement.entitlements.max_resolution}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Watermark:</span>
                <div className="flex items-center gap-2">
                  {entitlement.entitlements.watermark ? (
                    <>
                      <Check className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Applied</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Not Applied</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-white">Feature Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Face Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Multiple Processors</span>
              </div>
              <div className="flex items-center gap-2">
                {entitlement.entitlements.max_video_sec > 30 ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">Extended Videos</span>
              </div>
              <div className="flex items-center gap-2">
                {entitlement.entitlements.max_resolution !== "480p" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">HD Quality</span>
              </div>
              <div className="flex items-center gap-2">
                {!entitlement.entitlements.watermark ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">No Watermark</span>
              </div>
              <div className="flex items-center gap-2">
                {entitlement.entitlements.concurrency > 1 ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300">Parallel Processing</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntitlementViewModal;
