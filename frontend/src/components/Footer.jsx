import React from 'react'
import {footerStyles as styles} from '../assets/FRONTEND/dummyStyles';
import logo from '../assets/FRONTEND/logocar.png'
import { Link } from 'react-router-dom';
import { FaEnvelope, FaFacebook, FaFacebookF, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaTwitter, FaYoutube } from 'react-icons/fa';
import { GiCarKey } from 'react-icons/gi';


const Footer = () => {
  return (
   <>
    <footer className={styles.container}>
       <div className={styles.topElements}>
         <div className={styles.circle1} />
         <div className={styles.circle2} />
         <div className={styles.roadLine} />
       </div>

       <div className={styles.innerContainer}> 
        <div className={styles.grid}>
         <div className={styles.brandSection}>
           <Link to='/' className='flex items-center'>
            <div className={styles.logoContainer}>
                <img src={logo} alt="logo" 
                className='h-[1em] w-auto block'
                style={{
                    display: "block",
                    objectFit: "contain",
                }}
                />
                <span className={styles.logoText}>ExploreCar</span>
            </div>
           </Link>
           <p className={styles.description}>
             Premium car rental service with the latest models and exceptional 
             customer services. Drive your dream car today!
           </p>

           <div className={styles.socialIcons}>
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaYoutube].map(
                (Icon, i) => (
                    <a href='/' key={i} className={styles.socialIcon}>
                      <Icon />
                    </a>
                )
              )}
           </div>
         </div>

         {/* quick link */}
         <div>
            <h3 className={styles.sectionTitle}>Quick Links
                <span className={styles.underline} />
            </h3>
            <ul className={styles.linkList}>
            {['Home',  'Cars', 'Contact Us'].map(
                (link, i) => (
                    <li key={i}>
                     <a href={
                       link === 'Home' ? '/' : link === 'Cars' ? '/cars' : '/contact'
                     } className={styles.linkItem}>
                        <span className={styles.bullet}></span>
                       {link}
                     </a>
                    </li>
                )
              )}
             </ul>
         </div>


         {/* contact info */}
          <div >
            <h3 className={styles.sectionTitle}>Contact Info
                <span className={styles.underline} />
          </h3>

          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>123 Car Street, Auto City</span>
            </li>

            <li className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <span>+91 9XXXX XXXXX</span>
            </li>

            <li className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <span>contact@exploreCar.com </span>
            </li>
          </ul>

          <div className={styles.hoursContainer}>
            <h4 className={styles.hoursTitle}>Working Hours</h4>
             <div className={styles.hoursText}>
                <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 4:00 PM</p>
              </div>
          </div>



        </div>

        {/* NEWA LETTER */}
        <div>
            <h3 className={styles.sectionTitle}>Newsletter
                 <span className={styles.underline} />
            </h3>
            <p className={styles.newsletterText}>
             Subsribe for special offers and updates!
             </p>
            <form className='space-y-3' >
                <input type='email' placeholder='Enter your email' className={styles.input} />
                <button type='submit' className={styles.subscribeButton}>
                    <GiCarKey className='mr-2 text-lg sm:text-xl' />
                    Subscribe Now
                </button>
            </form>
            
        </div>
       </div>
       </div>
    </footer>
   </>
  )
}

export default Footer