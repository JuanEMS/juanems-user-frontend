const API_URL = process.env.REACT_APP_API_URL;

export const generateUserID = async (role) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/generate-userid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) throw new Error('Failed to generate userID');
    const data = await response.json();
    return data.userID;
  } catch (error) {
    console.error('Error generating userID:', error);
    return null;
  }
};

export const checkAvailability = async (value, type, excludeId = null) => {
  try {
    const res = await fetch(`${API_URL}/api/admin/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [type]: value, excludeId }),
    });
    return await res.json();
  } catch (error) {
    console.error(`Error checking ${type} availability:`, error);
    return { error: true };
  }
};

export const createOrUpdateAccount = async (values, id = null) => {
  const url = id ? `${API_URL}/api/admin/accounts/${id}` : `${API_URL}/api/admin/create-account`;
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Operation failed');
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error with account operation:', error);
    return { success: false, error: error.message };
  }
};

export const fetchAccount = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/admin/accounts/${id}`);
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to load account data.');
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error fetching account:', error);
    return { success: false, error: error.message };
  }
};

export const logSystemAction = async (logData) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/system-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    const data = await response.json();
    console.log('System log recorded:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to record system log:', error);
    return { success: false, error: error.message };
  }
};
