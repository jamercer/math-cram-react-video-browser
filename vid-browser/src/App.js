import "./style.css";
import React, { Component } from "react"

let pageContentCount = 12;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      subject: "",
      content: [[[]]],
      activePage: {},
      nextPage: {}
    }
  }

  componentDidMount() {
    this.getContent();
  }

  getContent = () => {
    fetch("/api/videos", {mode: "cors"}) // this only works locally atm :<
      .then(response => response.json())
      .then(json => {
        this.prepareVideoContent(json);
    });
  }
    
  prepareVideoContent = (data) => {
    let sortedContent = {};
    data.forEach(c => {
      if (sortedContent[c.subject] === undefined) sortedContent[c.subject] = []
      sortedContent[c.subject].push(c);
    });
    
    Object.keys(sortedContent).forEach(subject => {
      let numPages = Math.ceil(sortedContent[subject].length/pageContentCount)
      let preparedContent = [];
      for (let i = 0; i < numPages; i++) {
        preparedContent.push(sortedContent[subject].slice(i*pageContentCount, i*pageContentCount + pageContentCount));
      }
      sortedContent[subject] = preparedContent;
    })

    let initSubject = Object.keys(sortedContent)[0];
    this.setState({
      subject:initSubject,
      content:sortedContent,
      activePage:sortedContent[initSubject][this.state.page - 1]
    })
  }

  updatePage = (pageNum) => {
    this.setState({activePage:this.state.content[this.state.subject][pageNum - 1]});
  }

  updateSubject = (subjectName) => {
    this.setState({subject:subjectName, page: 1, activePage:this.state.content[subjectName][0]});
  }

  pageButtonClick = (pageNum) => {
    // validate pageNum
    pageNum = Math.min(Math.max(pageNum, 1), this.state.content[this.state.subject].length);
    if (pageNum !== this.state.page) {
      this.setState({page:pageNum})
      this.updatePage(pageNum);
    }
  }

  nextButtonClick = () => {
    this.pageButtonClick(this.state.page + 1)
  }

  previousButtonClick = () => {
    this.pageButtonClick(this.state.page - 1)
  }

  renderSubjects = () => {
    let r = [];
    let s = Object.keys(this.state.content);
    if (s !== undefined) {
      Object.keys(this.state.content).forEach(s=>{
        if (s === this.state.subject) {
          r.push(<SubjectTab subjectName={s} handleClick={this.updateSubject} key={s} hilighted />);
        } else {
          r.push(<SubjectTab subjectName={s} handleClick={this.updateSubject} key={s} />);
        }
      })
      return r;
    }
    return
  }

  renderContentCards = () => {
    if (this.state.activePage.length > 0) {
      return this.state.activePage.map(c=><ContentCard title={c.title} thumbnail={"https://www.mrsksmathcram.com/" + c.thumbnail} content={c.get_absolute_url}/>)
    }
  }

  renderPageButtons = () => {
    if (this.state.content[this.state.subject] !== undefined) {
      let r =[];
      r.push(<PageButton previous handleClick={this.previousButtonClick}/>);
      for (let i = 0; i < this.state.content[this.state.subject].length; i++) {
        if (this.state.page === i+1) {
          r.push(<PageButton page={i+1} current handleClick={this.pageButtonClick}/>);
        } else {
          r.push(<PageButton page={i+1} handleClick={this.pageButtonClick}/>);
        }
      }
      r.push(<PageButton next handleClick={this.nextButtonClick}/>)
      return r;
    }
    return;
  }

  render() {
    return (
      <div className="page-div">
        <div className="page-navigation" key="page-navigation">
          <h1>Subjects</h1>
          {this.renderSubjects()}
        </div>
        <div className="page-content" key="page-content">
          <div className="page-content-cardgrid">
            {this.renderContentCards()}
            <div className="pagination-pagelinks">
              {this.renderPageButtons()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function SubjectTab(props) {
  function handleClick() {
    props.handleClick(props.subjectName);
  }
  
  if (props.hilighted) {
    return (<a className="highlighted" key={props.subjectName}>{props.subjectName}</a>)
  } else {
    return (<a onClick={handleClick} key={props.subjectName}>{props.subjectName}</a>)
  }
}

function ContentCard(props) {
  return (
    <a href={props.content} className="card-link-container" key="props.title">
      <div className="card">
        <img className="card-img-top" src={props.thumbnail} alt={props.title} />
        <div className="card-body">
          <p className="card-text">{props.title}</p>
        </div>
      </div>
    </a>
  );
}

function PageButton(props) {
  function handleClick() {
    props.handleClick(props.page);
  }

  if (props.next) {
    return (<a className="endless_page_link" onClick={handleClick} key="next">&gt;</a>);
  } else if (props.previous) {
    return (<a className="endless_page_link" onClick={handleClick} key="previous">&lt;</a>);
  } else if (props.separator) {
    return (<span className="endless_separator" key="separator">...</span>);
  } else if (props.current) {
    return (<span className="endless_page_current" key={props.page}><strong>{props.page}</strong></span>);
  } else {
    return (<a className="endless_page_link" onClick={handleClick} key={props.page}>{props.page}</a>);
  }
}

export default App;