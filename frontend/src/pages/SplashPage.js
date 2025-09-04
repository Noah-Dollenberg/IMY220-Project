// NJ Noah Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

const SplashPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
  };

  const openSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignUp(false);
  };

  const backgroundIcons = [
    {
      id: 1,
      opacity: 0.2,
      scale: 2,
      rotation: 15,
      x: 10,
      y: 20,
      speed: 1
    },
    {
      id: 2,
      opacity: 0.1,
      scale: 1,
      rotation: -25,
      x: 70,
      y: 60,
      speed: 0.5
    },
    {
      id: 3,
      opacity: 0.3,
      scale: 3,
      rotation: 45,
      x: 80,
      y: 15,
      speed: 1.5
    },
    {
      id: 4,
      opacity: 0.4,
      scale: 5,
      rotation: -10,
      x: 20,
      y: 75,
      speed: 1.8
    }
  ];

  return (
    <div className="splash-page">
      {backgroundIcons.map((icon) => (
        <div
          key={icon.id}
          className="parallax-icon"
          style={{
            position: 'absolute',
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            opacity: icon.opacity,
            transform: `
              translate(
                ${-mousePosition.x * icon.speed * 20}px,
                ${-mousePosition.y * icon.speed * 20}px
              )
              scale(${icon.scale})
              rotate(${icon.rotation}deg)
            `,
            transition: 'transform 0.3s ease-out',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <img
            src="/assets/images/backgroundIcon.png"
            style={{
              width: '120px',
              height: '120px',
              filter: 'blur(1px)'
            }}
          />
        </div>
      ))}

      <main className="splash-main">
        <div className="container">
          <div className="splash-content">
            <div className="brand-section">
              <div className="logo">
                <div className="logo-icon">[B]</div>
                <h1 className="brand-name">BranchOut.</h1>
              </div>
              <p className="brand-tagline">Don't just commit.</p>
            </div>
            <div className="hero-section">
              <h2 className="hero-title">
                Collaborate with teammates, track your code history, and showcase your work all in one powerful, easy-to-use platform
              </h2>
              <div className="cta-buttons">
                <button
                  className="btn btn-primary btn-large"
                  onClick={openLogin}
                >
                  LOGIN
                </button>
                <button
                  className="btn btn-secondary btn-large"
                  onClick={openSignUp}
                >
                  SIGN UP
                </button>
              </div>
              <p className="free-text">Do it! It's Free!!</p>
            </div>
            <footer className="splash-footer">
              <p>&copy;BranchOut</p>
            </footer>
          </div>
        </div>
      </main>
      {(showLogin || showSignUp) && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>
              &times;
            </button>
            {showLogin && <LoginForm />}
            {showSignUp && <SignUpForm />}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashPage;