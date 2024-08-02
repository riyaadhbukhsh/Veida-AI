"use client";
import React, { useEffect, useState } from "react";


// testing api requests cross server
export default function Home() {

  const [message, setMessage] = useState("Loading");
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then((response) => response.json())
      .then((data) =>{ 
      setMessage(data.message);
      setPeople(data.people);
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
    </div>
  );
}