import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { yourTasks } from '../selectors';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { withRouter } from 'react-router';
import DataSpinner from '../../../core/components/DataSpinner';
import AppConstants from '../../../common/AppConstants';
import { debounce, throttle } from 'throttle-debounce';
import YourTasks from './YourTasks';

export class YourTasksContainer extends React.Component {

  componentDidMount() {
    this.loadYourTasks(false, 'sort=due,desc');
    const that = this;
    this.timeoutId = setInterval(() => {
      const { yourTasks } = that.props;
      this.loadYourTasks(true, yourTasks.get('yourTasksSortValue'), yourTasks.get('yourTasksFilterValue'));
    }, AppConstants.ONE_MINUTE);
  }

  componentWillMount() {
    this.goToTask = this.goToTask.bind(this);
    this.sortYourTasks = this.sortYourTasks.bind(this);
    this.filterTasksByName = this.filterTasksByName.bind(this);
    this.debounceSearch = this.debounceSearch.bind(this);
  }

  loadYourTasks(skipLoading, yourTasksSortValue, yourTasksFilterValue = null) {
    this.props.fetchTasksAssignedToYou(yourTasksSortValue, yourTasksFilterValue, skipLoading);
  }

  goToTask(taskId) {
    this.props.history.replace(`/task?taskId=${taskId}`);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  debounceSearch(sortValue, filterValue) {
    if (filterValue.length <= 2 || filterValue.endsWith(' ')) {
      throttle(200, () => {
        this.props.fetchTasksAssignedToYou(sortValue, filterValue, true);
      })();
    } else {
      debounce(500, () => {
        this.props.fetchTasksAssignedToYou(sortValue, filterValue, true);
      })();
    }
  };

  filterTasksByName(event) {
    event.persist();
    const { yourTasks } = this.props;
    this.debounceSearch(yourTasks.get('yourTasksSortValue'), event.target.value);
  };

  sortYourTasks(event) {
    this.props.fetchTasksAssignedToYou(event.target.value,
      this.props.yourTasks.get('yourTasksFilterValue'), true);
  };

  render() {
    const { yourTasks } = this.props;
    if (yourTasks.get('isFetchingTasksAssignedToYou')) {
      return <DataSpinner message="Fetching tasks assigned to you"/>;
    } else {
      return <YourTasks
        filterTasksByName={this.filterTasksByName}
        sortYourTasks={this.sortYourTasks}
        goToTask={this.goToTask}
        yourTasks={yourTasks} startAProcedure={() => this.props.history.replace("/procedures")}/>;
    }
  }
}

YourTasksContainer.propTypes = {
  fetchTasksAssignedToYou: PropTypes.func.isRequired,
  yourTasks: ImmutablePropTypes.map
};

const mapStateToProps = createStructuredSelector({
  yourTasks: yourTasks,
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(YourTasksContainer));
