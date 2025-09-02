// NJ Noah Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

const SplashPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <div className="splash-page">
      <div
        className="code-background"
        style={{
          transform: `translateY(${parallaxOffset * 0.5}px)`
        }}
      >
        <svg
          width="800"
          height="600"
          viewBox="0 0 512 512"
          className="code-symbol"
        >
          <path
            fill="#F5CB5C"
            opacity="0.1"
            d="M160 368L32 256l128-112 22.4 25.6L73.6 256l108.8 86.4L160 368zm192 0l-22.4-25.6L438.4 256 329.6 169.6L352 144l128 112-128 112zM320 96L192 416h-32L288 96h32z"
          />
        </svg>
      </div>
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