function NewJobPostForm() {
    return (
        <form>
            <div>
                <label htmlFor="jobTitle">Job Title:</label>
                <input type="text" id="jobTitle" name="jobTitle" required />
            </div>
            <div>
                <label htmlFor="jobDescription">Job Description:</label>
                <textarea id="jobDescription" name="jobDescription" required></textarea>
            </div>
            <button type="submit">Post Job</button>
        </form>
    );
}

export default NewJobPostForm;