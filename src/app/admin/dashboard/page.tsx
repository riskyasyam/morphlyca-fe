"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

import type { User } from "@/types/user";
import type { QuotaToday, Job } from "@/types/job";

import { fetchMe, fetchMySubscription } from "@/lib/me";
import { fetchQuotaToday } from "@/lib/jobs";        
import { fetchJobs } from "@/lib/jobs";              
import { getMediaOutputTotal } from "@/lib/media";   

const fmt = (n: number | undefined | null) =>
  new Intl.NumberFormat("en-US").format(Number(n ?? 0));

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [me, setMe] = useState<User | null>(null);
  const [quotaToday, setQuotaToday] = useState<QuotaToday | null>(null);
  
  // Data subscription yang lebih lengkap
  const [subscription, setSubscription] = useState<any>(null);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);

  const [mediaTotal, setMediaTotal] = useState<number>(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  
  // Pagination untuk recent jobs
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentJobs.length / itemsPerPage);
  const currentJobs = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return recentJobs.slice(start, start + itemsPerPage);
  }, [recentJobs, currentPage]);

  const usedToday = useMemo(() => {
    if (!quotaToday) return 0;
    return (quotaToday.dailyLimit ?? 0) - (quotaToday.remaining ?? 0);
  }, [quotaToday]);

  async function loadAll() {
    setLoading(true);
    try {
      // Load user data dari endpoint baru
      try {
        const meData = await fetchMe();
        console.log("User data loaded:", meData);
        setMe(meData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMe(null);
      }

      // Load subscription data dari endpoint baru
      try {
        const subData = await fetchMySubscription();
        console.log("Subscription data loaded:", subData);
        setSubscription(subData.subscription);
        setEntitlements(subData.subscription?.entitlements);
        setUsage(subData.usage);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setSubscription(null);
        setEntitlements(null);
        setUsage(null);
      }

      // quota weight hari ini (tetap dari endpoint lama)
      const qt = await fetchQuotaToday().catch((err) => {
        console.error("Error fetching quota:", err);
        return null;
      });
      setQuotaToday(qt);

      // total media outputs (facefusion)
      const total = await getMediaOutputTotal().catch((err) => {
        console.error("Error fetching media total:", err);
        return 0;
      });
      setMediaTotal(total);

      // recent jobs user (ambil lebih banyak untuk pagination)
      const jobs = await fetchJobs({ take: 20, skip: 0 }).catch((err) => {
        console.error("Error fetching jobs:", err);
        return [];
      });
      setRecentJobs(jobs);
      setCurrentPage(0); // reset ke halaman pertama
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="relative z-[60] pointer-events-auto text-white">
        <h2 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-900 border border-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-[60] pointer-events-auto text-white space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1">Welcome, {me?.displayName ?? "User"}</h2>
          <p className="text-slate-400">
            {me?.email} • Role: <span className="uppercase">{me?.role}</span>
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700"
          disabled={refreshing}
        >
          {refreshing ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Refreshing…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </span>
          )}
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-slate-300 mb-2">Current Plan</h3>
          <p className="text-xl font-semibold">
            {subscription?.planName ? `${subscription.planName} (${subscription.planCode})` : "Free Plan"}
          </p>
          {subscription?.planPriority !== null && (
            <p className="text-xs text-slate-400 mt-1">Priority: {subscription.planPriority}</p>
          )}
          <div className={clsx(
            "inline-block px-2 py-1 rounded text-xs mt-2",
            subscription?.status === "ACTIVE" 
              ? "bg-green-600/20 text-green-300" 
              : "bg-orange-600/20 text-orange-300"
          )}>
            {subscription?.status || "No Subscription"}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-slate-300 mb-2">Daily Weight Quota</h3>
          <p className="text-3xl font-bold">{fmt(entitlements?.daily_weight_quota || quotaToday?.remaining)}</p>
          <p className="text-xs text-slate-400 mt-1">
            Remaining: {fmt(quotaToday?.remaining)}
          </p>
          <div className="mt-3 h-2 bg-gray-800 rounded overflow-hidden">
            <div
              className={clsx(
                "h-full transition-all",
                (quotaToday?.remaining ?? 0) > 0 ? "bg-emerald-500" : "bg-red-500"
              )}
              style={{
                width: `${
                  Math.min(
                    100,
                    ((entitlements?.daily_weight_quota ?? quotaToday?.dailyLimit ?? 0) === 0
                      ? 0
                      : (((entitlements?.daily_weight_quota ?? quotaToday?.dailyLimit ?? 0) - (quotaToday?.remaining ?? 0)) /
                          (entitlements?.daily_weight_quota ?? quotaToday?.dailyLimit ?? 1)) *
                        100)
                  ).toFixed(1)
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Used today: {fmt((entitlements?.daily_weight_quota ?? quotaToday?.dailyLimit ?? 0) - (quotaToday?.remaining ?? 0))}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-slate-300 mb-2">Plan Limits</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Concurrency:</span>
              <span className="text-white">{entitlements?.concurrency || 1}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Max Video:</span>
              <span className="text-white">{entitlements?.max_video_sec || 30}s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Resolution:</span>
              <span className="text-white">{entitlements?.max_resolution || "720p"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Watermark:</span>
              <span className={entitlements?.watermark ? "text-red-300" : "text-green-300"}>
                {entitlements?.watermark ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart sederhana untuk status jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
          <div className="space-y-3">
            {['SUCCEEDED', 'FAILED', 'RUNNING', 'QUEUED'].map(status => {
              const count = recentJobs.filter(j => j.status === status).length;
              const percentage = recentJobs.length > 0 ? (count / recentJobs.length) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-slate-400">{status}</div>
                  <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all",
                        status === "SUCCEEDED" && "bg-emerald-500",
                        status === "FAILED" && "bg-red-500",
                        status === "RUNNING" && "bg-blue-500",
                        status === "QUEUED" && "bg-yellow-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs text-slate-400">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Most Used Processors</h3>
          <div className="flex items-center justify-center">
            {/* Donut Chart untuk processor usage */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="8"
                />
                
                {/* Processor usage segments */}
                {(() => {
                  const processorCounts = recentJobs.reduce((acc, job) => {
                    if (Array.isArray(job.processors)) {
                      job.processors.forEach(proc => {
                        acc[proc] = (acc[proc] || 0) + 1;
                      });
                    }
                    return acc;
                  }, {} as Record<string, number>);

                  const totalUsage = Object.values(processorCounts).reduce((sum, count) => sum + count, 0);
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
                  
                  let cumulativePercentage = 0;
                  const circumference = 2 * Math.PI * 40;

                  return Object.entries(processorCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5) // Top 5 processors
                    .map(([processor, count], index) => {
                      const percentage = totalUsage > 0 ? count / totalUsage : 0;
                      const strokeDasharray = `${percentage * circumference} ${circumference}`;
                      const strokeDashoffset = -cumulativePercentage * circumference;
                      cumulativePercentage += percentage;

                      return (
                        <circle
                          key={processor}
                          cx="60"
                          cy="60"
                          r="40"
                          fill="none"
                          stroke={colors[index]}
                          strokeWidth="8"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      );
                    });
                })()}
                
                {/* Center text */}
                <text x="60" y="65" textAnchor="middle" className="fill-white text-xs font-medium transform rotate-90">
                  Processors
                </text>
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-1">
            {(() => {
              const processorCounts = recentJobs.reduce((acc, job) => {
                if (Array.isArray(job.processors)) {
                  job.processors.forEach(proc => {
                    acc[proc] = (acc[proc] || 0) + 1;
                  });
                }
                return acc;
              }, {} as Record<string, number>);

              const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
              
              return Object.entries(processorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([processor, count], index) => (
                  <div key={processor} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-slate-300 truncate max-w-20">{processor}</span>
                    </div>
                    <span className="text-slate-400">{count}</span>
                  </div>
                ));
            })()}
            
            {recentJobs.length === 0 && (
              <p className="text-xs text-slate-400 text-center">No processor data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent jobs table - smaller and with pagination */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Recent Jobs</h3>
          <a
            href="/admin/explore"
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded"
            style={{
              background: "linear-gradient(90deg, #A0D45B 0%, #DDFFB1 34.55%, #7EBE2A 100%)",
              color: "#0B1400",
            }}
          >
            <PlayCircle className="w-3 h-3" />
            New Job
          </a>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-300">
              <tr className="border-b border-gray-800">
                <th className="text-left py-1.5 pr-3">Job ID</th>
                <th className="text-left py-1.5 pr-3">Status</th>
                <th className="text-left py-1.5 pr-3">Processors</th>
                <th className="text-left py-1.5 pr-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No recent jobs.
                  </td>
                </tr>
              ) : (
                currentJobs.map((j) => (
                  <tr key={j.id} className="border-b border-gray-900/60">
                    <td className="py-1.5 pr-3 font-mono">{j.id.substring(0, 8)}...</td>
                    <td className="py-1.5 pr-3">
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-xs",
                          j.status === "SUCCEEDED" && "bg-emerald-600/20 text-emerald-300",
                          j.status === "FAILED" && "bg-red-600/20 text-red-300",
                          j.status === "RUNNING" && "bg-blue-600/20 text-blue-300",
                          j.status === "QUEUED" && "bg-yellow-600/20 text-yellow-300"
                        )}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 truncate max-w-24">
                      {Array.isArray(j.processors) ? j.processors.join(", ") : "-"}
                    </td>
                    <td className="py-1.5 pr-3">
                      {new Date(j.createdAt ?? "").toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs text-slate-400">
              Page {currentPage + 1} of {totalPages} ({recentJobs.length} total)
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
