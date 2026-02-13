"use client";

import React, { useState, useEffect } from "react";
import { complaintsApi } from "../../lib/api";

export function ComplaintDebug() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        console.log("🔍 Fetching complaints...");
        setLoading(true);
        const result = await complaintsApi.getAll();
        console.log("📊 Complaints result:", result);
        setComplaints(result);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching complaints:", err);
        setError(err.message || "Failed to fetch complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">🐛 Complaint Debug</h3>

      {loading && <div className="text-blue-600">Loading complaints...</div>}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded border">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <div className="mb-2">
            <strong>Total complaints found: {complaints.length}</strong>
          </div>

          {complaints.length === 0 ? (
            <div className="text-yellow-600 bg-yellow-50 p-3 rounded border">
              No complaints returned from API
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.map((complaint, index) => (
                <div
                  key={complaint.id || index}
                  className="p-2 bg-white border rounded"
                >
                  <div>
                    <strong>ID:</strong> {complaint.id}
                  </div>
                  <div>
                    <strong>Category:</strong> {complaint.category}
                  </div>
                  <div>
                    <strong>Description:</strong> {complaint.description}
                  </div>
                  <div>
                    <strong>Priority:</strong> {complaint.priority}
                  </div>
                  <div>
                    <strong>Status:</strong> {complaint.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
