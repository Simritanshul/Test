import React, { useState } from "react";
import axios from "axios";
import "./App.css";
function App() {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [newFeature, setNewFeature] = useState({ featureName: "", environments: {}, users: {} });
  const [userId, setUserId] = useState("");

  // Get all feature flags
  const fetchFeatureFlags = async () => {
    try {
      const response = await axios.get("http://localhost:5000/feature-flags");
      setFeatureFlags(response.data);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
    }
  };

  // Get feature flag for user
  const getFeatureFlag = async (featureName, userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/feature-flags/${featureName}/${userId}`);
      alert(`Feature for User ${userId}: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error("Error fetching feature flag:", error);
    }
  };

  // Create or update feature flag
  const createOrUpdateFeatureFlag = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/feature-flags/${newFeature.featureName}`, newFeature);
      alert(`Feature flag created/updated: ${response.data.featureName}`);
    } catch (error) {
      console.error("Error creating/updating feature flag:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Feature Flags</h1>

      {/* Fetch Feature Flags */}
      <button 
        onClick={fetchFeatureFlags} 
        className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
        Fetch Feature Flags
      </button>

      {/* Display Feature Flags */}
      <div className="mt-6 w-full max-w-2xl">
        {featureFlags.length > 0 && (
          <ul className="bg-white p-4 rounded-lg shadow-md space-y-2">
            {featureFlags.map((flag) => (
              <li key={flag._id} className="border-b pb-2 last:border-none text-gray-700">
                <span className="font-semibold">{flag.featureName}:</span> {JSON.stringify(flag.environments)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create/Update Feature Flag */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Create/Update Feature Flag</h3>
        <input
          type="text"
          placeholder="Feature Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={newFeature.featureName}
          onChange={(e) => setNewFeature({ ...newFeature, featureName: e.target.value })}
        />
        <button 
          onClick={createOrUpdateFeatureFlag} 
          className="w-full bg-green-600 text-white px-6 py-2 mt-4 rounded-lg shadow-md hover:bg-green-700 transition">
          Create/Update
        </button>
      </div>

      {/* Check Feature Flag for User */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Check Feature Flag for User</h3>
        <input
          type="text"
          placeholder="User ID"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button 
          onClick={() => getFeatureFlag("someFeature", userId)}
          className="w-full bg-purple-600 text-white px-6 py-2 mt-4 rounded-lg shadow-md hover:bg-purple-700 transition">
          Check Feature Flag
        </button>
      </div>
    </div>
  );
}

export default App;
