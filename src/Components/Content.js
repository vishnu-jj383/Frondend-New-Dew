import React from 'react';

function Content({ title, text,children }) {
  return (
    <section className="content">
      <h3>{title}</h3>
      <p>{text}</p>
      {children} {/* This renders any child elements passed to Content */}
    </section>
  );
}

export default Content;