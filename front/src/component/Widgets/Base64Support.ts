// DataURI化
// ファイルの中身のみ登録されるので、imgのsrcで指定するには先頭に"data:image/jpeg;base64,"が必要になる
const Base64Support = (base64: string) => {
  const image = "data:image/jpeg;base64," + base64;
  return image;
};

export default Base64Support;
