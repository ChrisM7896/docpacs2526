import React, { useEffect, useState } from 'react';

function JobPostList() {
    const [jobPosts, setJobPosts] = useState([]);

    useEffect(() => {
        // Fetch data from the backend API
        fetch('http://localhost:3001/api/job-posts')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((jobPosts) => setJobPosts(jobPosts))
            .catch((error) => console.error('Error fetching job posts:', error));
    }, []);

    return (
        <div>
            <h1>Job Posts</h1>

            <ul>
                {jobPosts.map((job) => (
                    <div key={job.id}>
                        <p>{job.description}</p>
                        <h6>{job.time}</h6>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default JobPostList;