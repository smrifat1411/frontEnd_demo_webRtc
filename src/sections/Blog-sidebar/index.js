import React from 'react';
import Link from 'next/link' 


import {FaSearch } from 'react-icons/fa'; 

import Button from 'reusecore/Button';

import WdThumb1 from 'assets/images/blog/widgets-thumb/01.png';
import WdThumb2 from 'assets/images/blog/widgets-thumb/02.png';
import WdThumb3 from 'assets/images/blog/widgets-thumb/03.png'; 

import BlogSideBarWrapper from './blogSidebar.style';

const SeideBar = () => {
  return (
    <BlogSideBarWrapper>
      <div className='sidebar-widgets'>
        <div className="search-box">
          <input type='text' placeholder='Search here...' />
          <Button>
            <FaSearch />
          </Button>
        </div>
      </div>

      <div className='sidebar-widgets recent-post'>
        <div className="widgets-title">
            <h3>Latest Post</h3>
        </div>
        <div className="recent-post-block">
          <img src={WdThumb1} alt="prime-app" />
          <div className="recent-post-content-block">
            <Link href="#">
              <a>
                <h3> Now led tedious shy. </h3>
              </a>
            </Link>
            <div className="post-meta-block">
              By:{' '}
              <Link href="#">
                <a> Admin </a>
              </Link>
              <Link href="#">
                <a> Aug 07, 2020 </a>
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-post-block">
          <img src={WdThumb2} alt="prime-app" />
          <div className="recent-post-content-block">
            <Link href="#">
            <a>
              <h3> Now led tedious shy. </h3>
            </a>
            </Link>
            <div className="post-meta-block">
              By:{' '}
              <Link href="#">
                <a> Admin </a>
              </Link>
              <Link href="#">
                <a> Aug 07, 2020 </a>
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-post-block">
          <img src={WdThumb3} alt="prime-app" />
          <div className="recent-post-content-block">
            <Link href="#">
            <a>
              <h3> Now led tedious shy. </h3>
            </a>
            </Link>
            <div className="post-meta-block">
              By:{' '}
              <Link href="#">
                <a> Admin </a>
              </Link>
              <Link href="#">
                <a> Aug 07, 2020 </a>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="recent-post-block">
          <img src={WdThumb1} alt="prime-app" />
          <div className="recent-post-content-block">
            <Link href="#">
            <a>
              <h3> Now led tedious shy. </h3>
            </a>
            </Link>
            <div className="post-meta-block">
              By:{' '}
              <Link href="#">
                <a> Admin </a>
              </Link>
              <Link href="#">
                <a> Aug 07, 2020 </a>
              </Link>
            </div>
          </div>
        </div>

      </div>

      <div className='sidebar-widgets catagorie'>
        <div className="widgets-title">
            <h3>Categories</h3>
        </div>
        <ul>
          <li>
            <Link href="#">
              <a>
                <span>Development</span>
                <em>(20)</em>
              </a>
            </Link>
          </li>
          <li>
            <Link href="#">
                <a>
                  <span>Technology</span>
                  <em>(12)</em>
                </a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a>
                <span>Testing</span>
                <em>(7)</em>
              </a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a>
                <span>Tech</span>
                <em>(11)</em>
              </a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a>
                <span>Block</span>
                <em>(14)</em>
              </a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a>
                <span>App</span>
                <em>(18)</em>
              </a>
            </Link> 
          </li>
        </ul>
      </div>
      <div className='sidebar-widgets tags'>
        <div className="widgets-title">
            <h3>Tags</h3>
        </div>
        <ul> 

          <li>
            <Link href="#"> 
              <a>Development</a>
            </Link>
          </li>
          <li>
            <Link href="#"> 
              <a>Technology</a>
            </Link>
          </li>
          <li>
            <Link href="#"> 
              <a>Testing</a>
            </Link>
          </li>
          <li>
            <Link href="#"> 
              <a>App Landing</a>
            </Link>
          </li>
          <li>
            <Link href="#"> 
              <a>App Landing</a>
            </Link>
          </li>
          <li>
            <Link href="#"> 
              <a>Science</a>
            </Link>
          </li>
        </ul>
      </div>
    </BlogSideBarWrapper>
  );
};

export default SeideBar;
