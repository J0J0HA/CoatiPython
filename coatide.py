import js as __js
import pyodide as __py

class CoatiFehler(BaseException): pass
class GegenSteinGelaufen(CoatiFehler): pass
class HierIstKeinWurm(CoatiFehler): pass
class HierIstSchonEinWurm(CoatiFehler): pass
class MehrereBaelleBewegt(CoatiFehler): pass


__errors = {
    "towardsstone": GegenSteinGelaufen("Du kannst nicht auf ein Feld laufen, auf dem ein Stein liegt."),
    "noworm": HierIstKeinWurm("Du kannst keinen Wurm aufheben, wenn kein Wurm daliegt."),
    "aworm": HierIstSchonEinWurm("Du kannst keinen Wurm auf ein Feld legen, auf dem schon einer liegt."),
    "multipleballs": MehrereBaelleBewegt("Man kann nicht mehrere Bälle gleichzeitig schieben.")
}

def __jsfunc(func):
    def __wrapper(*args, **kwargs):
        error = None
        try:
            result = func(*args, **kwargs)
        except __py.ffi.JsException as e:
            try:
                error = __errors[str(e).removeprefix("Error: ")]
            except KeyError as a:
                raise CoatiFehler("Dieser Fehler sollte nicht entstehen! Please report it (the entire message) on GitHub! (Go to Welcome Guide and click the desired link)") from e
        if error is not None:
            raise error
        __js.saveState()
        return result
    return __wrapper;

weiter             = __jsfunc(__js.window.coati.move)
drehe_links        = __jsfunc(__js.window.coati.turnLeft)
drehe_rechts       = __jsfunc(__js.window.coati.turnRight)
wurm_ablegen         = __jsfunc(__js.window.coati.putWorm)
wurm_aufheben      = __jsfunc(__js.window.coati.removeWorm)
auf_wurm          = __jsfunc(__js.window.coati.onWorm)
ball_vorne       = __jsfunc(__js.window.coati.ballFront)
stein_vorne      = __jsfunc(__js.window.coati.stoneFront)
stein_links       = __jsfunc(__js.window.coati.stoneLeft)
stein_rechts      = __jsfunc(__js.window.coati.stoneRight)

# BETA: Test to override input and print functions with alert and prompt functions
#       or add speech bubbles to interact with the figure. Only for coati.
eingabe_          = __jsfunc(__js.prompt)
ausgabe_           = __jsfunc(__js.alert)
