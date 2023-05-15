#!/bin/bash
#
export WORKING_DIR=$HOME/Documents/security_files
export REACT_APP_VERSION=0.1
export REACT_APP_ENVIRONMENT=DEVEL
# Split the current tmux window into two panes. The -i option makes the shell interactive and the -c option allows running a command in the shell
tmux split-window -v -c './frontend' 'bash -i -c "npm run start"'
tmux send-keys

# Create a new window for the backend, change directory, activate virtual environment, and start backend server
tmux new-window -n 'backend' -c './backend'
tmux send-keys 'source venv/bin/activate' C-m

# input field separator
while IFS=',' read -r key value; do
	# Match the key using case-insensitive regex and export the corresponding environmental variable
	case "$key" in
	# Match the key 'sid' with case-insensitive regex and export ORACLE_SID
	[Ss][Ii][Dd])
		export ORACLE_SID="$value"
		;;
	# Match the key 'host' with case-insensitive regex and export ORACLE_HOST
	[Hh][Oo][Ss][Tt])
		export ORACLE_HOST="$value"
		;;
	# Match the key 'password' with case-insensitive regex and export ORACLE_PASSWORD
	[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd])
		export ORACLE_PASSWORD="$value"
		;;
	# Match the key 'port' with case-insensitive regex and export ORACLE_PORT
	[Pp][Oo][Rr][Tt])
		export ORACLE_PORT="$value"
		;;
	# Match the key 'user' with case-insensitive regex and export ORACLE_USER
	[Uu][Ss][Ee][Rr])
		export ORACLE_USER="$value"
		;;
	# Ignore any other keys that don't match
	*) ;;
	esac
done <$WORKING_DIR/oracle

export REDIS_HOST=redis.kinnate
export REDIS_PASSWD=$(cat $WORKING_DIR/redis)

tmux send-keys 'python main.py' C-m

# Switch back to the first pane
tmux select-pane -t 0

# Attach to the tmux session to view the panes and windows
tmux attach-session
