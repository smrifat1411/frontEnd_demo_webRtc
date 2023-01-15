import React from 'react';
import Link from 'next/link'
import PropTypes from 'prop-types';
import { IoIosArrowRoundForward } from "react-icons/io";
import { Container, Row, Col } from 'reusecore/Layout';

import PageHeader from 'reusecore/PageHeader';
import Sidebar from "sections/Blog-sidebar";

import blogThumb1 from 'assets/images/blog/post/blog-post-1.png';
import blogThumb2 from 'assets/images/blog/post/blog-post-2.png';
import blogThumb3 from 'assets/images/blog/post/blog-post-3.png';
import blogThumb4 from 'assets/images/blog/post/blog-post-4.png';
import blogThumb5 from 'assets/images/blog/post/blog-post-5.png'; 
import blogThumb6 from 'assets/images/blog/post/blog-post-6.png'; 


import { BlogPageWrapper } from './blogGrid.style';

const BlogPage = () => {
  return (
    <BlogPageWrapper>
      <PageHeader 
        title="Blog Grid" 
        author={{name: 'Alexa', profile: '/#'}}
      />

        <div className="blog-page-wrapper">
          <Container>
            <Row>
              <Col xs={12} lg={8}>
                <div className='blog-grid-wrapper'>
                <Row>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                          <Link href="/blog-single">
                            <a>
                                <img src={blogThumb1} alt='img' />
                            </a>
                          </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single">
                            <a>Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep 2020</span>
                          </div>
                          <h2 className='post-title'>
                            <Link href="/blog-single">
                              <a>
                                  Now led tedious shy.
                              </a>
                            </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single"> 
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                          <Link href="/blog-single"> 
                            <a>
                              <img src={blogThumb2} alt='img' />
                            </a> 
                          </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single"> 
                             <a>Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep, 2020</span>
                          </div>
                          <h2 className='post-title'>
                            <Link href="/blog-single"> 
                              <a>
                                Now led tedious shy.
                              </a>
                            </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single">  
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                          <Link href="/blog-single">  
                            <a>
                              <img src={blogThumb3} alt='img' />
                            </a>
                          </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single">  
                            <a >Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep, 2020</span>
                          </div>
                          <h2 className='post-title'>
                          <Link href="/blog-single">  
                            <a>
                                Now led tedious shy.
                            </a>
                          </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single">  
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                          <Link href="/blog-single">  
                            <a>
                              <img src={blogThumb4} alt='img' />
                            </a>
                          </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single">  
                            <a>Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep, 2020</span>
                          </div>
                          <h2 className='post-title'>
                          <Link href="/blog-single">  
                            <a>
                              Now led tedious shy.
                            </a>
                          </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single">  
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                        <Link href="/blog-single">  
                          <a>
                            <img src={blogThumb5} alt='img' />
                          </a>
                        </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single">  
                            <a>Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep, 2020</span>
                          </div>
                          <h2 className='post-title'>
                            <Link href="/blog-single">  
                              <a>
                                  Now led tedious shy.
                              </a>
                            </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single">  
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='post-block'>
                      <div className='post-thumb-block'>
                        <Link href="/blog-single">  
                          <a>
                            <img src={blogThumb6} alt='img' />
                          </a>
                        </Link>
                      </div>
                      <div className="post-content-block">
                          <div className='post-meta-block'>
                          <span>In: </span>
                          <Link href="/blog-single">  
                            <a>Discussion</a>
                          </Link>
                          <span className='divider'>/</span>
                          <span>15 Sep, 2020</span>
                          </div>
                          <h2 className='post-title'>
                          <Link href="/blog-single">  
                            <a>
                                Now led tedious shy.
                            </a>
                          </Link>
                          </h2>
                          <p className='post-entry'>
                          Answer misery adieus add wooded how nay men before though.
                          Pretended belonging contented mrs suffering.
                          </p>
                          <Link href="/blog-single">  
                            <a className="readmore-btn">see more <IoIosArrowRoundForward/></a>
                          </Link>
                      </div>
                    </div>
                  </Col>
                </Row>
                  </div>
              </Col>
              <Col xs={12} lg={4}>
                <Sidebar/>
              </Col>
            </Row>
          </Container>
        </div>
    </BlogPageWrapper>
  );
};

// BlogPage style props
BlogPage.propTypes = {
  xs: PropTypes.number,
  sm: PropTypes.number,
  lg: PropTypes.number,
  title: PropTypes.string,
  author: PropTypes.object
};

export default BlogPage;
