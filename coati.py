import js as __js

def __jsfunc(func):
    def __wrapper():
        result = func()
        __js.saveState()
        return result
    return __wrapper;

move             = __jsfunc(__js.window.coati.move)
turn_left        = __jsfunc(__js.window.coati.turnLeft)
turn_right       = __jsfunc(__js.window.coati.turnRight)
put_worm         = __jsfunc(__js.window.coati.putWorm)
remove_worm      = __jsfunc(__js.window.coati.removeWorm)
on_worm           = __jsfunc(__js.window.coati.onWorm)
ball_front       = __jsfunc(__js.window.coati.ballFront)
stone_front      = __jsfunc(__js.window.coati.stoneFront)
stone_left       = __jsfunc(__js.window.coati.stoneLeft)
stone_right      = __jsfunc(__js.window.coati.stoneRight)
