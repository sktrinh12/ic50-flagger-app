#!/bin/bash
DB_TYPE="$1"
ENV="$2"

export WORKING_DIR=$HOME/Documents/security_files
# Split the current tmux window into two panes. The -i option makes the shell interactive and the -c option allows running a command in the shell
tmux split-window -v -c './frontend' 'bash -i -c "export REACT_APP_VERSION=0.1 && export REACT_APP_ENVIRONMENT=DEVEL && npm run start"'
# tmux send-keys

# Create a new window for the backend, change directory, activate virtual environment, and start backend server
tmux new-window -n 'backend' -c './backend'
tmux send-keys 'source venv/bin/activate' C-m

if [ $ENV == 'PROD' ]; then
	while IFS=',' read -r key value; do
		case "$key" in
		[Ss][Ii][Dd])
			tmux send-keys -t 'backend' "export ORACLE_SID=\"$value\"" C-m
			;;
		[Hh][Oo][Ss][Tt])
			tmux send-keys -t 'backend' "export ORACLE_HOST=\"$value\"" C-m
			echo $ORACLE_HOST
			;;
		[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd])
			tmux send-keys -t 'backend' "export ORACLE_PASS=\"$value\"" C-m
			;;
		[Pp][Oo][Rr][Tt])
			tmux send-keys -t 'backend' "export ORACLE_PORT=\"$value\"" C-m
			;;
		[Uu][Ss][Ee][Rr][Nn][Aa][Mm][Ee])
			tmux send-keys -t 'backend' "export ORACLE_USER=\"$value\"" C-m
			;;
		*) ;;
		esac
	done <"$WORKING_DIR/oracle2"
fi

tmux send-keys "export DB_TYPE=$DB_TYPE" C-m
tmux send-keys "export ENV=$ENV" C-m
tmux send-keys "export REDIS_HOST=redis.kinnate" C-m
tmux send-keys "export REDIS_PASSWD=$(cat $WORKING_DIR/redis)" C-m

tmux send-keys 'python main.py' C-m
tmux split-window -v 'vi app'

# Switch back to the first pane
tmux select-pane -t 0

# Attach to the tmux session to view the panes and windows
tmux attach-session
