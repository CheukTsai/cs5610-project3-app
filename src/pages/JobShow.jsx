import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from 'components/NavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import 'styling/jobshow.css'
import 'styling/job.css'
import axios from 'commons/axios'

function JobShow({ user, setUser, setSearch }) {

    const navigate = useNavigate()
    const [curStatus, setCurStatus] = useState("LOADING")
    const [appliedStatus, setAppliedStatus] = useState("?")
    const [favorites, setFavorites] = useState([]);
    const [job, setJob] = useState([])
    const [favoriteStatus, setFavoriteStatus] = useState("LOADING")
    const [changeStatus, setChangeStatus] = useState(false)
    const id = window.location.pathname.replace('/job/', '');

    const handleAddToFavorites = async () => {
        await axios.post(`/api/users/favorites/add`, { id: id, status: "" }).then(response => {
            toast.success(response.data.message);
            setFavoriteStatus("YES")
        }).catch(error => {
            toast.error(error.message);
        });
    }

    useEffect(() => {
        axios.get(`/api/jobs/job/${id}`)
            .then(res => {
                setJob(res.data);
                setCurStatus("PREPARED")
            }).catch(
                err => {
                    navigate(-1)
                }
            )
    }, [])
    useEffect(() => {
        const id = window.location.pathname.replace('/job/', '');
        axios.get('/api/users/favorites').then(
            response => {
                setFavorites(response.data)
                const idx = response.data.findIndex(favorite => !!favorite.job && favorite.job._id === id)
                if (idx !== -1) {
                    setFavoriteStatus("YES");
                    console.log(response.data[idx])
                    setAppliedStatus(response.data[idx].status)
                }
                else setFavoriteStatus("NO")
            }
        )
    }, [])

    const handleStatusChange = async (data) => {
        const id = window.location.pathname.replace('/job/', '');
        await axios.put(`/api/users/favorites/${id}`, { status: data }).then(
            response => {
                setAppliedStatus(response.data.status)
                toast.success(response.data.message)
            }
        ).catch(err => {
            toast.error(err.message)
        })
    }


    function create() {
        return (<div dangerouslySetInnerHTML={{ __html: job.jobDescription }} />)
    }


    const handleDelete = () => {
        const id = window.location.pathname.replace('/job/', '');
        axios.delete(`/api/jobs/job/${id}`).then(response => {
            navigate('/posts')
            toast.success('Successfully deleted')
        }).catch(err => {
            toast.error(err.message)
        })
    }
    // const handleDelete = async () => {
    //     try {
    //         await axios.delete(`/api/jobs/delete/${id}`);
    //         toast.success("Successfully delete")
    //         navigate(-1);
    //     } catch (error) {
    //         const message = error.response.data.message;
    //         toast.error(message);
    //     }
    // }

    const handleRemoveFromFavorites = async () => {
        axios.post(`/api/users/favorites/remove`, { id }).then(response => {
            toast.success(response.data.message);
            setFavoriteStatus("NO")
        }).catch(error => {
            toast.error(error.message);
        });
    }

    function render() {
        if (curStatus === "LOADING" || appliedStatus === "LOADING") return null;
        else if (user.email !== job.posterEmail) {
            if (favoriteStatus === "YES") {
                return (<div>
                    <div className="btn-job d-flex justify-content-center align-items-center mx-3 mb-3" onClick={() => handleRemoveFromFavorites()} >Unlike</div>
                    <select className="form-select btn-job mx-3 text-center status d-flex justify-content-center" value={appliedStatus} onChange={(e) => {
                        handleStatusChange(e.target.value)
                    }}>
                        <option value="Not Started">Not Started</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div >)
            }
            else {
                return (<div className="btn-job d-flex justify-content-center align-items-center mx-3" onClick={() => handleAddToFavorites()}> <FontAwesomeIcon icon={faHeart} className="heart" />Favorite</ div>);
            }

        }
        else return (
            null
        )
    }

    return (
        <React.Fragment>
            <NavBar user={user} setUser={setUser} setSearch={setSearch} />
            <div className="page-wrapper jobshow d-flex w-100 justify-content-center">
                <div className="jobshow-wrapper d-flex flex-column ">
                    <div className="jobshow-header d-flex justify-content-between">
                        <div className="btn-job d-flex justify-content-center align-items-center " onClick={() => { navigate(-1) }}> {"<"} Back</div>
                        {render()}
                    </div>
                    <div className="jobshow-content text-center d-flex flex-column align-items-center">
                        <div className="card-title job-title jobshow-title">{job.title}</div>
                        <div className="info money mb-3">
                            <p className="card-text"><FontAwesomeIcon icon={faMoneyBill} /> ${job.salary}</p>
                        </div>
                        <div className="d-flex">
                            <div className="text-muted job-subtitle mb-3 mx-3">{job.companyName}</div>
                            <div className="text-muted job-subtitle mb-3 mx-3">{job.location}</div>
                        </div>
                        <div className="description-wrapper mb-3 mt-3">
                            <p className="card-text text-muted text-start"></p>
                            <div>{create()}</div>
                        </div>
                        <div className="job-footer mt-5">{job.createdAt}</div >
                    </div>
                    <div className="d-flex align-self-center">
                        {user.username && user.email !== job.posterEmail ?
                            (<a href={`mailto:${job.contact}`} className="btn-job d-flex justify-content-center align-items-center mx-3"><FontAwesomeIcon icon={faEnvelope} className="heart" />Recruiter</a>)
                            :
                            (<div></div>)}
                        {user.username && user.email === job.posterEmail ?
                            (<React.Fragment>
                                <Link to={`/edit/${id}`} className="btn-job d-flex justify-content-center align-items-center mx-3">Edit</Link>
                                <div className="btn-job d-flex justify-content-center align-items-center mx-3 bg-red" onClick={() => {
                                    handleDelete()
                                }}>Delete</div>
                            </React.Fragment>
                            )
                            :
                            (<div></div>)}
                    </div>

                </div>
            </div>
        </React.Fragment>
    )
}

export default JobShow
