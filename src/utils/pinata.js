const uploadToPinata = async (eventName, date, price) => {
  try {
    const payload = { eventName, date };
    if (price !== undefined && price !== null && price !== "") {
      payload.price = price;
    }

    const response = await fetch('http://localhost:5001/upload-to-pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload to Pinata');
    }

    return data.ipfsUri;
  } catch (error) {
    console.error('Error uploading to Pinata:', error.message);
    throw error;
  }
};

export default uploadToPinata;