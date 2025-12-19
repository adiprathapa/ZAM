const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Gets or creates a unique Device ID for this browser.
 * This ensures data privacy without requiring login.
 */
function getDeviceId() {
    let deviceId = localStorage.getItem('zam_device_id');
    if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('zam_device_id', deviceId);
    }
    return deviceId;
}

export async function fetchAnalyses() {
    try {
        const response = await fetch(`${API_BASE_URL}/analyses`, {
            headers: {
                'x-device-id': getDeviceId()
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching analyses: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch analyses:", error);
        throw error;
    }
}

export async function saveAnalysis(analysisData) {
    try {
        const response = await fetch(`${API_BASE_URL}/analyses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': getDeviceId()
            },
            body: JSON.stringify(analysisData),
        });

        if (!response.ok) {
            throw new Error(`Error saving analysis: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to save analysis:", error);
        throw error;
    }
}

// DELETE analysis
export async function deleteAnalysis(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
            method: 'DELETE',
            headers: {
                'x-device-id': getDeviceId()
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete analysis');
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to delete analysis:", error);
        throw error;
    }
}
