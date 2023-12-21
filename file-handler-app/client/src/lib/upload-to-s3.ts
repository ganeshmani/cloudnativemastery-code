export const uploadToS3 = async (file: File, url: string) => {
  const result = await fetch(url, {
    method: "PUT",
    body: file,
  });

  return result;
};
