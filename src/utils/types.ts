// Interfaces for structured data
export interface Company {
    name: string;
    url: string
    description?: string;
    foundedYear?: string;
    teamSize?: number;
    location?: string;
    jobs?: Job[];
    founders?: Founder[];
    posts?: Posts; // details of posts
    latestNews?: News[]; // URLs of latest news stories
    imageURL?: string;
  }
  
  export interface Posts {
    lauchLink: string;
    postsList?: Post[];
  }

  export interface Post {
    title?: string;
    details?: string[];
    links?: string[];
    imageLinks?: string[];
    videoLinks?: string[];
  }
  export interface News {
    title: string;
    link?: string;
    date?: string;
  }
  export interface Job {
    role: string;
    locations?: string[];
    link?: string;
  }
  
  export interface Founder {
    name: string;
    designation?: string;
    linkedIn?: string;
    twitter?: string;
    about?: string;
  }
  