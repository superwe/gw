gw
==

great wall

bishenghua yuanjing zhaiyanbin hejinlong

cmd:
mkdir gw
cd gw
git init
git config --global user.email net.bsh@gmail.com
git config --global user.name bishenghua
git config --global core.editor vim
git config --global remote.origin.url git@github.com:superwe/gw.git
git pull -f origin


git add test.txt
git commit -m 'test'
git push -u origin master:master
