const uploadToPinata = async (eventName, date, price) => {
  try {
    const response = await fetch('http://localhost:5001/upload-to-pinata', { // Updated port to 5001
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventName, date, price }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to upload to Pinata');
    }

    return data.ipfsUri; // Return the IPFS URI to use in smart contract
  } catch (error) {
    console.error('Error uploading to Pinata:', error.message);
    throw error;
  }
};

export default uploadToPinata;