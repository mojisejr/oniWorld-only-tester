import { useRouter } from "next/router";
function OniProfile() {
  const { query } = useRouter();
  return (
    <div>
      <h1>Oni #{query.tokenId}</h1>
    </div>
  );
}

export default OniProfile;
