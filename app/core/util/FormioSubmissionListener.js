import PubSub from "pubsub-js";

class FormioSubmissionListener {
    constructor(form, props) {
        this.form = form;
        this.props = props;
    }

    initialize() {
        this.form.formio.on('error', errors => {
            PubSub.publish('formSubmissionError', {
                errors: errors,
                form: this.form
            });
            window.scrollTo(0, 0);
        });
        this.form.formio.on('submit', () => {
            PubSub.publish('formSubmissionSuccessful');
        });
        this.form.formio.on('change', (value) => {
            PubSub.publish('formChange', value);
        });
        this.form.formio.on('prevPage', () => {
            PubSub.publish('clear');
        });

        this.form.formio.on('componentError', (error) => {
            const path = this.props.history.location.pathname;
            const user = this.props.kc.tokenParsed.email;
            this.props.log([{
                user: user,
                path: path,
                level: 'error',
                form: {
                    name: this.form.name,
                    path: this.form.path,
                    display: this.form.display
                },
                message: error.message,
                component: {
                    label: error.component.label,
                    key: error.component.key
                }
            }]);
        });

    }
}

export default FormioSubmissionListener;
