pnpm run rebuild
echo "Rebuilt sources"
path_project=$1

echo "Deploy to project $path_project"
rm -rf $path_project/node_modules/@minimaltech/node-infra/dist
echo "Clean up old sources"

mv dist $path_project/node_modules/@minimaltech/node-infra
echo "Deployed sources"
