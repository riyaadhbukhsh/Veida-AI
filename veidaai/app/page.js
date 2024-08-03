"use client";
import React, { useEffect, useState } from "react";


// testing api requests cross server
export default function Home() {

  const [message, setMessage] = useState("Loading");
  const [people, setPeople] = useState([]);

  //!MongoDB Test Users @RB
  const [test_users_db, setTestUsersDb] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then((response) => response.json())
      .then((data) =>{ 
      setMessage(data.message);
      setPeople(data.people);
 
      setTestUsersDb(data.test_users_db);
    });
  }, []);
  return (
    <div>
      {message}
      <div>
      {people.map((person, index) => (
        <div key={index}>{person}</div>
      ))}
      </div>

      <div>
        <h1>MongoDB Test Users</h1>
        {test_users_db.map((user,index) => (
          <div key={index} style={{margin: "10px", border: "1px solid black", padding: "10px"}}> Name: {user.name} ||| Email: {user.email} </div>
        ))}
      </div>
    </div>

  
  );
}
