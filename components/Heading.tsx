// *********************
// Role of the component: Simple H2 heading component
// Name of the component: Heading.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Heading title={title} color={color} />
// Input parameters: { title: string; color?: string }
// Output: h2 heading title with some styles 
// *********************

import React from 'react'

const Heading = ({ title, color = "white" } : { title: string; color?: string }) => {
  const textColor = color === "slate" ? "text-slate-800" : "text-white";
  return (
    <h2 className={`${textColor} text-5xl font-bold text-center mt-10 max-lg:text-4xl`}>{ title }</h2>
  )
}

export default Heading