if [[ -n $(git status --porcelain) ]]; then
    echo "There are uncommited changes -- please commit before proceeding with testing"
else
    echo "Update testing instance..."
    git checkout testing > /dev/null 2>&1
    git merge -X theirs three > /dev/null 2>&1
    git commit -m "Update testing instance..." > /dev/null 2>&1

    echo "Uploading to Heroku..."
    git remote add testing git@heroku.com:hezekiah-testing.git > /dev/null 2>&1
    git push -f testing testing:master > /dev/null 2>&1
    git checkout three > /dev/null 2>&1

    echo "Resetting Database..."
    node _build/database.create.testing.js > /dev/null 2>&1

    echo "Running Mocha tests..."
    mocha
fi
