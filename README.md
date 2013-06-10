gw
==

great wall

bishenghua yuanjing zhaiyanbin hejinlong

初始化工程:
cmd:
mkdir gw
cd gw
git init
git config --global user.email net.bsh@gmail.com
git config --global user.name bishenghua
git config --global core.editor vim
git config --global remote.origin.url git@github.com:superwe/gw.git
git pull -f origin #下载代码(同 svn up)


添加文件:
git add test.txt
git commit -m 'test' #提交到本地master库中
git push -u origin master:master #将本地的master库提交到远程服务器的master库(同 svn ci -m 'commit')
