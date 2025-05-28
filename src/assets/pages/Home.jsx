import "./Home.css";

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          <h1>Premium support for your <br/>
          <span className="highlight">Furry Friend.</span>
          </h1>
          <p> Discover a wide range of pet care services tailored for your beloved companion. 
          From grooming to vet visits, we are here to help you give your pet the love and attention they deserve.</p>
          <button className="learn-btn">Learn More</button>
        </div>
        <div className="hero-right">
          <img src="pet.png" alt="happypet" />
        </div>
      </section>

      <section className="features">
        <h2>Why PetPals?</h2>
        <div className="feature-list">
          <div className="feature-card">
            <img src="/community.png" alt="Community" />
            <h3>Pet Community</h3>
            <p>Connect with pet lovers and find local events and friends.</p>
          </div>
          <div className="feature-card">
            <img src="/service.png" alt="Services" />
            <h3>All-in-One Services</h3>
            <p>Book grooming, walking, sitting and more in one app.</p>
          </div>
          <div className="feature-card">
            <img src="/health.png" alt="Health" />
            <h3>Pet Health Tips</h3>
            <p>Get tailored health advice and wellness reminders.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
