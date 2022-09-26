import js as __js
import pyodide as __py

class CoatiError(BaseException): pass
class MovedTowardsStone(CoatiError): pass
class NoWormThere(CoatiError): pass
class WormAlreadyPlaced(CoatiError): pass
class MovedMultipleBalls(CoatiError): pass


__errors = {
    "towardsstone": MovedTowardsStone("Can't move! There is a stone in the way!"),
    "noworm": NoWormThere("No worm to remove"),
    "aworm": WormAlreadyPlaced("There is already a worm"),
    "multipleballs": MovedMultipleBalls("Can't move multiple balls at the same time!")
}

def __jsfunc(func):
    def __wrapper():
        try:
            result = func()
        except __py.JsException as e:
            try:
                raise __errors[str(e).removeprefix("Error: ")]
            except KeyError as a:
                raise CoatiError("This Error is not meant to be thrown! Please report it (the entire message) on GitHub! (Go to Welcome Guide and click the desired link)") from e
        __js.saveState()
        return result
    return __wrapper;

move             = __jsfunc(__js.window.coati.move)
turn_left        = __jsfunc(__js.window.coati.turnLeft)
turn_right       = __jsfunc(__js.window.coati.turnRight)
put_worm         = __jsfunc(__js.window.coati.putWorm)
remove_worm      = __jsfunc(__js.window.coati.removeWorm)
on_worm          = __jsfunc(__js.window.coati.onWorm)
ball_front       = __jsfunc(__js.window.coati.ballFront)
stone_front      = __jsfunc(__js.window.coati.stoneFront)
stone_left       = __jsfunc(__js.window.coati.stoneLeft)
stone_right      = __jsfunc(__js.window.coati.stoneRight)
