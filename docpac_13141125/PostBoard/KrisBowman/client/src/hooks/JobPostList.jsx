import React, { useEffect, useState } from 'react';

function JobPostList() {
    const [jobPosts, setJobPosts] = useState([]);

    useEffect(() => {
        // Fetch data from the backend API
        fetch('http://localhost:3001/api/job-posts')
            .then((response) => response.json())
            .then((data) => setJobPosts(data))
            .catch((error) => console.error('Error fetching job posts:', error));
    }, []);

    return (
        <div>
            <h1>Job Posts</h1>
            <ul>
                {jobPosts.map((job) => (
                    <div key={job.id}>
                        <h2>Job Title: {job.title}</h2>
                        <h4>Posted by: {job.postedBy}</h4>
                        <p>{job.description}</p>
                        <h6>{job.time}</h6>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default JobPostList;