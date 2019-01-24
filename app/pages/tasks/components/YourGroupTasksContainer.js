import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import * as actions from '../actions';
import { yourGroupTasks } from '../selectors';
import { withRouter } from 'react-router';
import DataSpinner from '../../../core/components/DataSpinner';
import YourGroupTasks from './YourGroupTasks';
import { debounce, throttle } from 'throttle-debounce';
import AppConstants from '../../../common/AppConstants';

export class YourGroupTasksContainer extends React.Component {

  componentDidMount() {
    this.loadYourGroupTasks(false, 'sort=due,desc');
    const that = this;
    this.timeoutId = setInterval(() => {
      const { yourGroupTasks } = that.props;
      this.loadYourGroupTasks(true, yourGroupTasks.get('yourGroupTasksSortValue'), yourGroupTasks.get('yourGroupTasksFilterValue'));
    }, AppConstants.ONE_MINUTE);
  }

  componentWillMount() {
    this.goToTask = this.goToTask.bind(this);
    this.sortYourGroupTasks = this.sortYourGroupTasks.bind(this);
    this.filterTasksByName = this.filterTasksByName.bind(this);
    this.debounceSearch = this.debounceSearch.bind(this);
  }

  goToTask(taskId) {
    this.props.history.replace(`/task?taskId=${taskId}`);
  }

  loadYourGroupTasks(skipLoading, yourGroupTasksSortValue, yourGroupTasksFilterValue = null) {
    this.props.fetchYourGroupTasks(yourGroupTasksSortValue, yourGroupTasksFilterValue, skipLoading);
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
        this.props.fetchYourGroupTasks(sortValue, filterValue, true);
      })();
    } else {
      debounce(500, () => {
        this.props.fetchYourGroupTasks(sortValue, filterValue, true);
      })();
    }
  };

  filterTasksByName(event) {
    event.persist();
    const { yourGroupTasks } = this.props;
    this.debounceSearch(yourGroupTasks.get('yourGroupTasksSortValue'),
      event.target.value);
  };

  sortYourGroupTasks(event) {
    this.props.fetchYourGroupTasks(event.target.value,
      this.props.yourGroupTasks.get('yourGroupTasksFilterValue'), true);
  };

  render() {
    const { yourGroupTasks } = this.props;
    if (yourGroupTasks.get('isFetchingYourGroupTasks')) {
      return <DataSpinner message="Fetching your group tasks"/>;
    }

    return <YourGroupTasks filterTasksByName={this.filterTasksByName}
                           yourGroupTasks={yourGroupTasks}
                           sortYourGroupTasks={this.sortYourGroupTasks}
                           goToTask={this.goToTask} startAProcedure={() => this.props.history.replace("/procedures")}/>;
  }
}

YourGroupTasksContainer.propTypes = {
  fetchYourGroupTasks: PropTypes.func.isRequired,
  yourGroupTasks: ImmutablePropTypes.map
};

const mapStateToProps = createStructuredSelector({
  yourGroupTasks,
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(YourGroupTasksContainer));
