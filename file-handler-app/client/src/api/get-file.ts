export const getFiles = async () => {
  const result = await fetch(
    "https://zvpyqtm84h.execute-api.us-east-1.amazonaws.com/files"
  );
  const data = await result.json();
  return data;
};
