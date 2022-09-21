import js as __js

def __jsfunc(func):
    def __wrapper():
        result = func()
        __js.saveState()
        return result
    return __wrapper;

move            = __jsfunc(__js.window.coati.move)
turnLeft        = __jsfunc(__js.window.coati.turnLeft)
turnRight       = __jsfunc(__js.window.coati.turnRight)
putLeaf         = __jsfunc(__js.window.coati.putLeaf)
removeLeaf      = __jsfunc(__js.window.coati.removeLeaf)
onLeaf          = __jsfunc(__js.window.coati.onLeaf)
mushroomFront   = __jsfunc(__js.window.coati.mushroomFront)
treeFront       = __jsfunc(__js.window.coati.treeFront)
treeLeft        = __jsfunc(__js.window.coati.treeLeft)
treeRight       = __jsfunc(__js.window.coati.treeRight)
