import React from 'react';
import './CasePages.scss';
import CaseResultsPanel from "./CaseResultsPanel";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import * as actions from '../actions';
import {withRouter} from "react-router";
import {connect} from "react-redux";
import withLog from "../../../core/error/component/withLog";
import {businessKeyQuery, caseSearchResults, searching} from "../selectors";
import {debounce} from 'throttle-debounce';

class CasesPage extends React.Component {

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.reset();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {
        const {caseSearchResults, searching, businessKeyQuery} = this.props;
        return <React.Fragment>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <h3 className="govuk-heading-l">Cases</h3>
                </div>
                <div className="govuk-grid-column-one-third">
                    <div className="govuk-form-group input-icon">
                        <input className="govuk-input" placeholder="Search using a BF number" id="bfNumber"
                               onChange={(event) => {
                                   const that = this;
                                   const query = event.target.value;
                                   debounce(500, () => {
                                       that.props.findCasesByKey(query);
                                   })()
                               }}
                               name="bfNumber" type="text"/><i className="fa fa-search fa-lg"
                                                               style={{marginLeft: '5px'}}/>

                    </div>
                </div>
            </div>
            <CaseResultsPanel {...{caseSearchResults, searching, businessKeyQuery}}/>
        </React.Fragment>
    }
}

CasesPage.propTypes = {
    findCasesByKey: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    businessKeyQuery: PropTypes.string,
    searching: PropTypes.bool,
    caseSearchResults: PropTypes.shape({
        _embedded: PropTypes.shape({
            cases: PropTypes.arrayOf(PropTypes.shape({
                businessKey: PropTypes.string,
                processInstances: PropTypes.arrayOf(PropTypes.object)
            }))
        }),
        _links: PropTypes.object,
        page: PropTypes.shape({
            size: PropTypes.number,
            totalElements: PropTypes.number,
            totalPages: PropTypes.number,
            number: PropTypes.number
        })
    })

};

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default withRouter(connect((state) => {
    return {
        kc: state.keycloak,
        appConfig: state.appConfig,
        businessKeyQuery: businessKeyQuery(state),
        caseSearchResults: caseSearchResults(state),
        searching: searching(state)
    }
}, mapDispatchToProps)(withLog(CasesPage)));
