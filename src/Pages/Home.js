import React from 'react';
import Header from '../Components/Header';
import Content from '../Components/Content';
import Footer from '../Components/Footer';

function Home() {
  return (
    <main className="main-content">
      <Header title="Welcome Back" subtitle="Your professional workspace" />
      <Content
        title="Home Overview"
        text="This is the home page of your Elite Dashboard, designed for efficiency and clarity."
      >
        {/* Dummy table */}
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>ID</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Value</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>1</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>Item A</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>100</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>2025-04-01</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>2</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>Item B</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>200</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>2025-04-02</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>3</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>Item C</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>300</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>2025-04-03</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default Home;

