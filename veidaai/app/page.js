"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [testUsersDb, setTestUsersDb] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then((response) => response.json())
      .then((data) => setTestUsersDb(data.test_users_db))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div>
      <button onClick={handleLoginRedirect}>Go to Login</button>
      <div>
        <h1>MongoDB Test Users</h1>
        {testUsersDb.map((user, index) => (
          <div key={index} style={{margin: "10px", border: "1px solid black", padding: "10px"}}>
            Name: {user.name} ||| Email: {user.email}
          </div>
        ))}
      </div>
    </div>
  );
}